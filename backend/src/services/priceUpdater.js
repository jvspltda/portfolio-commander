const cron = require('node-cron');
const prisma = require('../lib/prisma');
const { getAssetPrice, getUSDtoBRL, fetchCryptoBRLBatch } = require('./priceAPI');
const { logger } = require('../utils/logger');
const { checkAllAlerts } = require('./alertChecker');

const TIPOS_ATUALIZAVEIS = ['Cripto', 'Ação BR', 'Ação USA', 'ETF BR', 'ETF USA', 'BDR'];

/**
 * @param {number} [userId] - Se informado, atualiza apenas ativos deste usuário; caso contrário, todos.
 */
async function updateAllPrices(userId) {
  console.log('🔄 Iniciando atualização de preços...');
  logger.info('Iniciando atualização de preços');

  try {
    await getUSDtoBRL();

    const where = {
      ativo: true,
      tipo: { in: TIPOS_ATUALIZAVEIS }
    };
    if (userId != null) {
      where.userId = userId;
    }

    const assets = await prisma.asset.findMany({ where });

    console.log(`📊 Encontrados ${assets.length} ativos para atualizar`);

    const cryptoTickers = assets
      .filter((a) => a.tipo === 'Cripto')
      .map((a) => a.ticker);
    const cryptoPrices = await fetchCryptoBRLBatch(cryptoTickers);
    if (cryptoPrices.size > 0) {
      console.log(`🪙 CoinGecko: ${cryptoPrices.size} cripto(s) em uma requisição`);
    }

    let updated = 0;
    let failed = 0;

    for (const asset of assets) {
      try {
        let newPrice = null;
        if (asset.tipo === 'Cripto') {
          newPrice = cryptoPrices.get(String(asset.ticker).toUpperCase()) ?? null;
          if (newPrice == null) {
            newPrice = await getAssetPrice(asset);
          }
        } else {
          newPrice = await getAssetPrice(asset);
        }

        if (newPrice && newPrice > 0) {
          await prisma.$transaction([
            prisma.asset.update({
              where: { id: asset.id },
              data: { precoAtual: newPrice }
            }),
            prisma.priceHistory.create({
              data: { assetId: asset.id, preco: newPrice }
            })
          ]);

          console.log(`✅ ${asset.ticker}: ${asset.precoAtual} → ${newPrice}`);
          updated++;

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          console.log(`⚠️  ${asset.ticker}: Preço não disponível`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${asset.ticker}:`, error.message);
        failed++;
      }
    }

    console.log(`✅ Atualização concluída: ${updated} atualizados, ${failed} falharam`);
    logger.info(`Atualização concluída: ${updated} atualizados, ${failed} falharam`);

    return { updated, failed };
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    logger.error('Erro na atualização de preços:', error);
    throw error;
  }
}

function startPriceUpdateCron() {
  cron.schedule(
    '0 18 * * *',
    async () => {
      console.log('⏰ Atualização automática diária iniciada');
      try {
        await updateAllPrices();
        await checkAllAlerts();
      } catch (error) {
        console.error('Erro no cron de preços:', error);
        logger.error('Erro no cron de preços:', error);
      }
    },
    {
      timezone: 'America/Sao_Paulo'
    }
  );

  console.log('✅ Cron configurado: atualização diária às 18h');
  logger.info('Cron de atualização de preços configurado');
}

module.exports = {
  updateAllPrices,
  startPriceUpdateCron
};
