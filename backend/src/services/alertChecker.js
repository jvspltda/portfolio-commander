const cron = require('node-cron');
const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');
const { USD_BRL } = require('../utils/constants');
const { sendAlertEmail } = require('./mail');

const VALID_CONDICOES = new Set(['>', '<', '>=', '<=']);

function compare(actual, target, condicao) {
  if (!VALID_CONDICOES.has(condicao)) return false;
  switch (condicao) {
    case '>':
      return actual > target;
    case '<':
      return actual < target;
    case '>=':
      return actual >= target;
    case '<=':
      return actual <= target;
    default:
      return false;
  }
}

function assetValueBRL(asset) {
  return asset.quantidade * asset.precoAtual * (asset.currency === 'USD' ? USD_BRL : 1);
}

async function buildUserPortfolioContext(userIds) {
  const context = new Map();
  const ids = [...new Set(userIds)];
  await Promise.all(
    ids.map(async (uid) => {
      const assets = await prisma.asset.findMany({
        where: { userId: uid, ativo: true }
      });
      let total = 0;
      const values = new Map();
      for (const a of assets) {
        const v = assetValueBRL(a);
        values.set(a.id, v);
        total += v;
      }
      context.set(uid, { total, values });
    })
  );
  return context;
}

function evaluateAlert(alert, portfolioCtx) {
  const asset = alert.asset;
  if (!asset) {
    return { shouldTrigger: false, mensagem: null };
  }

  if (alert.tipo === 'preco') {
    const currentPrice = asset.precoAtual;
    if (typeof currentPrice !== 'number' || Number.isNaN(currentPrice)) {
      return { shouldTrigger: false, mensagem: null };
    }

    if (compare(currentPrice, alert.valorGatilho, alert.condicao)) {
      const sym = asset.currency === 'USD' ? 'US$' : 'R$';
      return {
        shouldTrigger: true,
        mensagem: `${asset.ticker} preço ${sym} ${currentPrice.toFixed(2)} (condição ${alert.condicao} ${alert.valorGatilho})`
      };
    }
    return { shouldTrigger: false, mensagem: null };
  }

  if (alert.tipo === 'percentual') {
    const valorAtual = asset.quantidade * asset.precoAtual * (asset.currency === 'USD' ? USD_BRL : 1);
    const valorEntrada = asset.quantidade * asset.precoEntrada * (asset.currency === 'USD' ? USD_BRL : 1);

    if (!valorEntrada || valorEntrada === 0) {
      return { shouldTrigger: false, mensagem: null };
    }

    const pl = ((valorAtual - valorEntrada) / valorEntrada) * 100;

    if (compare(pl, alert.valorGatilho, alert.condicao)) {
      return {
        shouldTrigger: true,
        mensagem: `${asset.ticker} P&L ${pl.toFixed(2)}% (gatilho ${alert.condicao} ${alert.valorGatilho}%)`
      };
    }
    return { shouldTrigger: false, mensagem: null };
  }

  if (alert.tipo === 'alocacao') {
    const ctx = portfolioCtx.get(alert.userId);
    if (!ctx || ctx.total <= 0) {
      return { shouldTrigger: false, mensagem: null };
    }
    const assetVal = ctx.values.get(alert.assetId) ?? 0;
    const pct = (assetVal / ctx.total) * 100;

    if (compare(pct, alert.valorGatilho, alert.condicao)) {
      return {
        shouldTrigger: true,
        mensagem: `${asset.ticker} representa ${pct.toFixed(2)}% do portfólio (gatilho ${alert.condicao} ${alert.valorGatilho}%)`
      };
    }
    return { shouldTrigger: false, mensagem: null };
  }

  return { shouldTrigger: false, mensagem: null };
}

async function triggerAlert(alert, mensagem) {
  await prisma.notification.create({
    data: {
      userId: alert.userId,
      alertId: alert.id,
      mensagem: `${mensagem} → ${alert.acaoSugerida}`
    }
  });

  if (alert.notificarEmail && alert.user?.email) {
    await sendAlertEmail({
      to: alert.user.email,
      subject: `[Portfolio Commander] Alerta: ${alert.asset?.ticker || 'ativo'}`,
      text: `${mensagem}\n\nAção sugerida: ${alert.acaoSugerida}\n\n— Portfolio Commander`
    });
  }

  await prisma.alert.update({
    where: { id: alert.id },
    data: {
      lastTriggered: new Date(),
      ativo: false
    }
  });

  logger.info(`🔔 Alerta disparado: ${mensagem}`);
}

async function processAlerts(alerts) {
  const userIds = alerts.map((a) => a.userId);
  const portfolioCtx = await buildUserPortfolioContext(userIds);

  let triggered = 0;

  for (const alert of alerts) {
    try {
      const { shouldTrigger, mensagem } = evaluateAlert(alert, portfolioCtx);
      if (shouldTrigger && mensagem) {
        await triggerAlert(alert, mensagem);
        triggered++;
      }
    } catch (error) {
      logger.error(`❌ Erro ao verificar alerta ${alert.id}:`, error.message);
    }
  }

  return triggered;
}

async function checkAllAlerts() {
  logger.info('🔔 Verificando todos alertas ativos...');

  const alerts = await prisma.alert.findMany({
    where: { ativo: true },
    include: {
      asset: true,
      user: true
    }
  });

  logger.info(`🔍 Encontrados ${alerts.length} alertas ativos`);

  const triggered = await processAlerts(alerts);
  logger.info(`✅ ${triggered} alertas disparados`);
  return triggered;
}

async function checkUserAlerts(userId) {
  const alerts = await prisma.alert.findMany({
    where: {
      userId,
      ativo: true
    },
    include: { asset: true, user: true }
  });

  return processAlerts(alerts);
}

function startAlertCheckCron() {
  cron.schedule(
    '*/15 * * * *',
    async () => {
      try {
        await checkAllAlerts();
      } catch (error) {
        logger.error('Erro no cron de alertas:', error);
      }
    },
    {
      timezone: 'America/Sao_Paulo'
    }
  );

  logger.info('Cron de verificação de alertas configurado (a cada 15 min)');
}

module.exports = {
  checkAllAlerts,
  checkUserAlerts,
  startAlertCheckCron
};
