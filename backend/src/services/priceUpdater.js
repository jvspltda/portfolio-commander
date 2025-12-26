const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { getAssetPrice, getUSDtoBRL } = require('./priceAPI');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

async function updateAllPrices() {
  console.log('🔄 Iniciando atualização de preços...');
  logger.info('Iniciando atualização de preços');

  await getUSDtoBRL();
  
  try {
    const assets = await prisma.asset.findMany({
      where: {
        tipo: {
          in: ['Cripto', 'Ação BR', 'Ação USA', 'ETF BR', 'ETF USA']
        }
      }
    });
    
    console.log(`📊 Encontrados ${assets.length} ativos para atualizar`);
    
    let updated = 0;
    let failed = 0;
    
    for (const asset of assets) {
      try {
        const newPrice = await getAssetPrice(asset);
        
        if (newPrice && newPrice > 0) {
          await prisma.asset.update({
            where: { id: asset.id },
            data: { precoAtual: newPrice }
          });
          
          console.log(`✅ ${asset.ticker}: ${asset.precoAtual} → ${newPrice}`);
          updated++;
          
          await new Promise(resolve => setTimeout(resolve, 1000));
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
  cron.schedule('0 18 * * *', async () => {
    console.log('⏰ Atualização automática diária iniciada');
    try {
      await updateAllPrices();
    } catch (error) {
      console.error('Erro no cron:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo'
  });
  
  console.log('✅ Cron configurado: atualização diária às 18h');
  logger.info('Cron de atualização de preços configurado');
}

module.exports = {
  updateAllPrices,
  startPriceUpdateCron
};
