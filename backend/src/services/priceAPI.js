
const axios = require('axios');

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || 'demo';

// Variável global para cotação USD/BRL
let USD_BRL_RATE = 5.43;
let USD_BRL_FETCHED_AT = 0;
const USD_BRL_TTL_MS = 120000;

// Buscar cotação do dólar (com cache — evita 429 na AwesomeAPI ao atualizar várias ações EUA)
async function getUSDtoBRL(forceRefresh = false) {
  if (!forceRefresh && Date.now() - USD_BRL_FETCHED_AT < USD_BRL_TTL_MS) {
    return USD_BRL_RATE;
  }
  try {
    const response = await axios.get('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
      timeout: 5000
    });

    if (response.data && response.data.USDBRL && response.data.USDBRL.bid) {
      USD_BRL_RATE = parseFloat(response.data.USDBRL.bid);
      USD_BRL_FETCHED_AT = Date.now();
      console.log(`💱 Cotação USD/BRL: R$ ${USD_BRL_RATE.toFixed(2)}`);
      return USD_BRL_RATE;
    }
    return USD_BRL_RATE;
  } catch (error) {
    console.error('Erro ao buscar cotação:', error.message);
    return USD_BRL_RATE;
  }
}

// Mapa de criptomoedas (CoinGecko)
const CRYPTO_MAP = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'LTC': 'litecoin',
  'HBAR': 'hedera-hashgraph',
  'LINK': 'chainlink',
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

// Buscar preço de ação brasileira (Brapi) — token opcional se receber 401
async function getBRStockPrice(ticker) {
  try {
    const token = process.env.BRAPI_TOKEN;
    const url = token
      ? `https://brapi.dev/api/quote/${ticker}?token=${encodeURIComponent(token)}`
      : `https://brapi.dev/api/quote/${ticker}`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data.results && response.data.results.length > 0) {
      return parseFloat(response.data.results[0].regularMarketPrice);
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar ${ticker} (BR):`, error.message);
    return null;
  }
}

// Buscar preço de ação americana (Alpha Vantage)
async function getUSStockPrice(ticker) {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
      const priceUSD = parseFloat(response.data['Global Quote']['05. price']);
      return priceUSD * USD_BRL_RATE;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar ${ticker} (US):`, error.message);
    return null;
  }
}

/**
 * Uma requisição CoinGecko para vários tickers (evita 429 no plano gratuito).
 * @param {Iterable<string>} tickers ex.: ['BTC','ETH']
 * @returns {Promise<Map<string, number>>} ticker em MAIÚSCULO → preço BRL
 */
async function fetchCryptoBRLBatch(tickers) {
  const upper = [...new Set([...tickers].map((t) => String(t).toUpperCase()))];
  const ids = [];
  const idSet = new Set();
  const tickerToId = {};
  for (const t of upper) {
    const id = CRYPTO_MAP[t];
    if (!id) continue;
    tickerToId[t] = id;
    if (!idSet.has(id)) {
      idSet.add(id);
      ids.push(id);
    }
  }
  const map = new Map();
  if (ids.length === 0) return map;

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=brl`;
    const response = await axios.get(url, { timeout: 12000 });
    const data = response.data;
    for (const t of upper) {
      const id = tickerToId[t];
      if (id && data[id]?.brl != null) {
        map.set(t, parseFloat(data[id].brl));
      }
    }
  } catch (error) {
    console.error('Erro CoinGecko (batch):', error.message);
  }
  return map;
}

// Buscar preço de criptomoeda (CoinGecko)
async function getCryptoPrice(ticker) {
  try {
    const coinId = CRYPTO_MAP[ticker];
    if (!coinId) {
      console.log(`Cripto ${ticker} não mapeada`);
      return null;
    }
    
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=brl`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data[coinId] && response.data[coinId].brl) {
      return parseFloat(response.data[coinId].brl);
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar ${ticker} (Cripto):`, error.message);
    return null;
  }
}

// Função principal para buscar preço de qualquer ativo
async function getAssetPrice(asset) {
  const { ticker, tipo } = asset;
  
  try {
    let price = null;
    
    if (tipo === 'Cripto') {
      price = await getCryptoPrice(ticker);
    } else if (tipo === 'Ação BR' || tipo === 'ETF BR' || tipo === 'BDR') {
      price = await getBRStockPrice(ticker);
    } else if (tipo === 'Ação USA' || tipo === 'ETF USA') {
      price = await getUSStockPrice(ticker);
    } else {
      console.log(`Tipo ${tipo} não tem atualização automática`);
      return null;
    }
    
    if (price && price > 0) {
      return price;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao buscar preço de ${ticker}:`, error.message);
    return null;
  }
}
module.exports = {
  getAssetPrice,
  getBRStockPrice,
  getUSStockPrice,
  getCryptoPrice,
  getUSDtoBRL,
  fetchCryptoBRLBatch
};
 
