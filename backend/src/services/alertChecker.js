const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

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
  
  let triggered = 0;
  
  for (const alert of alerts) {
    try {
      const asset = alert.asset;
      let shouldTrigger = false;
      let mensagem = '';
      
      // Verifica tipo de alerta
      if (alert.tipo === 'preco') {
        const currentPrice = asset.precoAtual;
        
        if (alert.condicao === '>' && currentPrice > alert.valorGatilho) {
          shouldTrigger = true;
          mensagem = `${asset.ticker} atingiu ${asset.currency === 'USD' ? 'US$' : 'R$'} ${currentPrice.toFixed(2)} (alvo: ${alert.valorGatilho})`;
        } else if (alert.condicao === '<' && currentPrice < alert.valorGatilho) {
          shouldTrigger = true;
          mensagem = `${asset.ticker} caiu para ${asset.currency === 'USD' ? 'US$' : 'R$'} ${currentPrice.toFixed(2)} (alerta: ${alert.valorGatilho})`;
        }
        
      } else if (alert.tipo === 'percentual') {
        const USD_BRL = 5.43;
        const valorAtual = asset.quantidade * asset.precoAtual * (asset.currency === 'USD' ? USD_BRL : 1);
        const valorEntrada = asset.quantidade * asset.precoEntrada * (asset.currency === 'USD' ? USD_BRL : 1);
        const pl = ((valorAtual - valorEntrada) / valorEntrada) * 100;
        
        if (alert.condicao === '>' && pl > alert.valorGatilho) {
          shouldTrigger = true;
          mensagem = `${asset.ticker} ganhou ${pl.toFixed(2)}% (alvo: ${alert.valorGatilho}%)`;
        } else if (alert.condicao === '<' && pl < alert.valorGatilho) {
          shouldTrigger = true;
          mensagem = `${asset.ticker} caiu ${pl.toFixed(2)}% (alerta: ${alert.valorGatilho}%)`;
        }
      } else if (alert.tipo === 'alocacao') {
        // TODO: Implementar lógica de alocação
      }
      
      if (shouldTrigger) {
        // Cria notificação
        await prisma.notification.create({
          data: {
            userId: alert.userId,
            alertId: alert.id,
            mensagem: `${mensagem} → ${alert.acaoSugerida}`
          }
        });
        
        // Atualiza alerta (marca timestamp e desativa)
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            lastTriggered: new Date(),
            ativo: false // Desativa após disparar (one-time trigger)
          }
        });
        
        triggered++;
        logger.info(`🔔 Alerta disparado: ${mensagem}`);
      }
      
    } catch (error) {
      logger.error(`❌ Erro ao verificar alerta ${alert.id}:`, error.message);
    }
  }
  
  logger.info(`✅ ${triggered} alertas disparados`);
  return triggered;
}

// Verifica alertas de um usuário específico
async function checkUserAlerts(userId) {
  const alerts = await prisma.alert.findMany({
    where: { 
      userId,
      ativo: true 
    },
    include: { asset: true }
  });
  
  let triggered = 0;
  
  for (const alert of alerts) {
    // Mesma lógica do checkAllAlerts mas só para este usuário
  }
  
  return triggered;
}

module.exports = { 
  checkAllAlerts,
  checkUserAlerts
};
