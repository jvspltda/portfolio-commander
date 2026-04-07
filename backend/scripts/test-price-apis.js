/**
 * Testa integrações de preço (sem gravar no banco).
 * Uso: node scripts/test-price-apis.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const axios = require('axios');
const { getBRStockPrice, getUSStockPrice, getUSDtoBRL } = require('../src/services/priceAPI');

const COINGECKO_IDS =
  'bitcoin,ethereum,solana,litecoin,chainlink,hedera-hashgraph';

async function main() {
  console.log('=== Teste APIs de preço ===\n');

  const usdBrl = await getUSDtoBRL();
  console.log('USD/BRL (AwesomeAPI):', usdBrl, '\n');

  const brSamples = ['PETR4', 'PRIO3', 'BERK34', 'IVVB11'];
  console.log('Brapi (BRL):', process.env.BRAPI_TOKEN ? '(com BRAPI_TOKEN)' : '(sem token — alguns tickers podem 401)');
  for (const t of brSamples) {
    const p = await getBRStockPrice(t);
    console.log(`  ${t}:`, p != null ? `R$ ${p}` : 'falhou / sem dado');
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log('\nCoinGecko (BRL) — uma requisição com vários ids:');
  try {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=brl`,
      { timeout: 8000 }
    );
    const map = [
      ['BTC', 'bitcoin'],
      ['ETH', 'ethereum'],
      ['SOL', 'solana'],
      ['LTC', 'litecoin'],
      ['LINK', 'chainlink'],
      ['HBAR', 'hedera-hashgraph']
    ];
    for (const [t, id] of map) {
      const p = data[id]?.brl;
      console.log(`  ${t}:`, p != null ? `R$ ${p}` : 'sem dado');
    }
  } catch (e) {
    console.log('  erro batch:', e.message, '(429 = rate limit; tente de novo em 1–2 min)');
  }

  console.log('\nAlpha Vantage → BRL (1 req a cada ~12s no plano free):');
  for (const t of ['SMH', 'GLD', 'JPM']) {
    const p = await getUSStockPrice(t);
    console.log(`  ${t}:`, p != null ? `~R$ ${p.toFixed(2)}` : 'falhou (defina ALPHA_VANTAGE_KEY)');
    await new Promise((r) => setTimeout(r, 12500));
  }

  console.log('\n=== Fim (ALPHA_VANTAGE_KEY no .env melhora EUA) ===');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
