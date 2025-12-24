const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

// Yahoo Finance - Ações BR/USA
async function fetchYahooPrice(ticker, suffix = '') {
  try {
    const symbol = suffix ? `${ticker}.${suffix}` : ticker;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const price = response.data.chart.result[0].meta.regularMarketPrice;
    return parseFloat(price);
  } catch (error) {
    logger.error(`Erro ao buscar ${ticker} no Yahoo:`, error.message);
    return null;
  }
}

// CoinGecko - Cripto
async function fetchCryptoPrice(ticker) {
  try {
    const coinMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'FET': 'fetch-ai',
      'RENDER': 'render-token',
      'ONDO': 'ondo-finance',
      'TAO': 'bittensor',
      'OLAS': 'autonolas',
      'ARKM': 'arkham',
      'AZERO': 'aleph-zero',
      'HNT': 'helium',
      'MAGIC': 'magic'
    };
    
    const coinId = coinMap[ticker] || ticker.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response.data[coinId]?.usd || null;
  } catch (error) {
    logger.error(`Erro ao buscar cripto ${ticker}:`, error.message);
    return null;
  }
}

// Atualiza TODOS os ativos
async function updateAllPrices() {
  logger.info('📊 Iniciando atualização de preços...');
  
  const assets = await prisma.asset.findMany({
    where: { ativo: true }
  });
  
  logger.info(`📈 Encontrados ${assets.length} ativos ativos`);
  
  let updated = 0;
  let errors = 0;
  let skipped = 0;
  
  for (const asset of assets) {
    try {
      let newPrice = null;
      
      // Determina qual API usar
      if (asset.tipo === 'Cripto' || asset.tipo === 'cripto') {
        newPrice = await fetchCryptoPrice(asset.ticker);
      } else if (asset.tipo.includes('BR') || asset.ticker.includes('3') || asset.ticker.includes('11')) {
        // Ações brasileiras (B3)
        newPrice = await fetchYahooPrice(asset.ticker, 'SA');
      } else if (asset.tipo.includes('USA') || asset.tipo.includes('Ação USA') || asset.tipo.includes('ETF USA') || asset.tipo.includes('Ouro') || asset.tipo.includes('CTAs') || asset.tipo.includes('Treasuries')) {
        // Ações americanas
        newPrice = await fetchYahooPrice(asset.ticker);
      } else if (asset.tipo === 'RF') {
        // Renda Fixa: não atualiza automaticamente
        skipped++;
        continue;
      }
      
      if (newPrice && newPrice > 0) {
        // Atualiza preço do ativo
        await prisma.asset.update({
          where: { id: asset.id },
          data: { precoAtual: newPrice }
        });
        
        // Salva no histórico
        await prisma.priceHistory.create({
          data: {
            assetId: asset.id,
            preco: newPrice
          }
        });
        
        updated++;
        logger.info(`✅ ${asset.ticker}: ${asset.currency === 'USD' ? 'US$' : 'R$'} ${newPrice.toFixed(2)}`);
      } else {
        errors++;
        logger.warn(`⚠️  ${asset.ticker}: Preço não disponível`);
      }
      
      // Rate limiting: espera 500ms entre chamadas
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      errors++;
      logger.error(`❌ Erro ao atualizar ${asset.ticker}:`, error.message);
    }
  }
  
  logger.info(`\n📊 Resumo: ${updated} atualizados, ${skipped} pulados (RF), ${errors} erros`);
  return { updated, skipped, errors };
}

// Atualiza um único ativo (sob demanda)
async function updateSinglePrice(assetId) {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });
    
    if (!asset) {
      throw new Error('Ativo não encontrado');
    }
    
    let newPrice = null;
    
    if (asset.tipo === 'Cripto' || asset.tipo === 'cripto') {
      newPrice = await fetchCryptoPrice(asset.ticker);
    } else if (asset.tipo.includes('BR')) {
      newPrice = await fetchYahooPrice(asset.ticker, 'SA');
    } else if (asset.tipo.includes('USA')) {
      newPrice = await fetchYahooPrice(asset.ticker);
    }
    
    if (newPrice && newPrice > 0) {
      await prisma.asset.update({
        where: { id: assetId },
        data: { precoAtual: newPrice }
      });
      
      await prisma.priceHistory.create({
        data: {
          assetId: asset.id,
          preco: newPrice
        }
      });
      
      return { success: true, price: newPrice };
    }
    
    return { success: false, error: 'Preço não disponível' };
    
  } catch (error) {
    logger.error(`Erro ao atualizar ativo ${assetId}:`, error);
    return { success: false, error: error.message };
  }
}

module.exports = { 
  updateAllPrices, 
  updateSinglePrice,
  fetchYahooPrice,
  fetchCryptoPrice 
};