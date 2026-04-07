const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const { withPgBouncerParam } = require('../src/lib/prismaUrl');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  datasources: {
    db: { url: withPgBouncerParam(process.env.DATABASE_URL) }
  }
});

/** Único usuário da aplicação — deve coincidir com ALLOWED_USER_EMAIL no backend (padrão jvsp.ltda2@gmail.com). */
const OWNER_EMAIL = 'jvsp.ltda2@gmail.com';

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Campo obrigatório no schema; não usado no login (acesso só com e-mail).
  const passwordHash = await bcrypt.hash('unused-password-placeholder', 10);
  
  const user = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {},
    create: {
      email: OWNER_EMAIL,
      password: passwordHash,
      name: 'João Victor'
    }
  });
  
  console.log('✅ Usuário criado:', user.email);

  await prisma.asset.deleteMany({
    where: { userId: user.id }
  });
  await prisma.alert.deleteMany({
    where: { userId: user.id }
  });
  console.log('🗑️  Ativos e alertas anteriores removidos\n');

  /** Referência de cotação informada (preço atual) */
  const refDate = new Date('2026-02-17T12:00:00.000Z');

  const assets = [
    // Ações / ETFs BR — qty, preço médio, preço atual 17/02/2026 (BRL)
    { ticker: 'AGRO3', name: 'BrasilAgro', carteira: 'A', tipo: 'Ação BR', quantidade: 32, precoEntrada: 20.36, precoAtual: 30.43, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'BBAS3', name: 'Banco do Brasil', carteira: 'A', tipo: 'Ação BR', quantidade: 200, precoEntrada: 25.43, precoAtual: 24.92, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'BERK34', name: 'Berkshire Hathaway BDR', carteira: 'A', tipo: 'BDR', quantidade: 64, precoEntrada: 130.49, precoAtual: 77.08, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'CMIG4', name: 'Cemig', carteira: 'A', tipo: 'Ação BR', quantidade: 520, precoEntrada: 11.76, precoAtual: 12.73, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'EMBJ3', name: 'Embpar', carteira: 'A', tipo: 'Ação BR', quantidade: 86, precoEntrada: 92.84, precoAtual: 86.99, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'ETHE11', name: 'Ethereum ETF', carteira: 'A', tipo: 'ETF BR', quantidade: 100, precoEntrada: 30.97, precoAtual: 49.61, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'GGBR4', name: 'Gerdau', carteira: 'A', tipo: 'Ação BR', quantidade: 240, precoEntrada: 21.65, precoAtual: 25.86, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'GOGL34', name: 'Alphabet BDR', carteira: 'A', tipo: 'BDR', quantidade: 78, precoEntrada: 132.93, precoAtual: 63.01, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'GOLD11', name: 'Ouro ETF', carteira: 'A', tipo: 'ETF BR', quantidade: 1965, precoEntrada: 27.35, precoAtual: 15.21, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'IVVB11', name: 'S&P 500 ETF', carteira: 'A', tipo: 'ETF BR', quantidade: 19, precoEntrada: 401.52, precoAtual: 261.9, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'JBSS32', name: 'JBS', carteira: 'A', tipo: 'Ação BR', quantidade: 67, precoEntrada: 83.22, precoAtual: 78.06, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'MELI34', name: 'MercadoLibre BDR', carteira: 'A', tipo: 'BDR', quantidade: 70, precoEntrada: 86.95, precoAtual: 71.18, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'N1VO34', name: 'Novo Nordisk BDR', carteira: 'A', tipo: 'BDR', quantidade: 62, precoEntrada: 32.22, precoAtual: 40.2, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'NASD11', name: 'Nasdaq ETF', carteira: 'A', tipo: 'ETF BR', quantidade: 62, precoEntrada: 17.99, precoAtual: 11.32, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'NVDC34', name: 'NVIDIA BDR', carteira: 'A', tipo: 'BDR', quantidade: 2060, precoEntrada: 19.95, precoAtual: 2.42, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'PETR4', name: 'Petrobras', carteira: 'A', tipo: 'Ação BR', quantidade: 370, precoEntrada: 36.89, precoAtual: 33.33, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'PRIO3', name: 'PRIO', carteira: 'A', tipo: 'Ação BR', quantidade: 144, precoEntrada: 52.56, precoAtual: 20.78, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'QBTC11', name: 'Bitcoin ETF (B3)', carteira: 'A', tipo: 'ETF BR', quantidade: 4842, precoEntrada: 21.89, precoAtual: 31.19, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'TAEE11', name: 'Taesa', carteira: 'A', tipo: 'Ação BR', quantidade: 135, precoEntrada: 43.6, precoAtual: 38.01, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'VALE3', name: 'Vale', carteira: 'A', tipo: 'Ação BR', quantidade: 72, precoEntrada: 87.03, precoAtual: 69.57, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'WEGE3', name: 'WEG', carteira: 'A', tipo: 'Ação BR', quantidade: 56, precoEntrada: 53.8, precoAtual: 35.85, currency: 'BRL', corretora: 'XP', dataCompra: refDate },

    // Renda fixa — posição em R$ (qty 1 = valor total da posição)
    { ticker: 'CDB-NEON-112', name: 'CDB Neon 112% CDI pós — venc. 09/2026', carteira: 'A', tipo: 'RF', quantidade: 1, precoEntrada: 57683, precoAtual: 57683, currency: 'BRL', corretora: 'Neon', dataCompra: refDate },
    { ticker: 'CRI-TRUE', name: 'CRI True Securitizadora IPCA+8,1% — venc. 11/2028', carteira: 'A', tipo: 'RF', quantidade: 1, precoEntrada: 893.07, precoAtual: 893.07, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'CDB-AGIBANK', name: 'CDB Agibank 15,3% a.a. — venc. 03/2027', carteira: 'A', tipo: 'RF', quantidade: 1, precoEntrada: 57131, precoAtual: 57131, currency: 'BRL', corretora: 'Agibank', dataCompra: refDate },
    { ticker: 'DEB-VERO', name: 'Debêntures Vero 15,5% a.a. — venc. 03/2031', carteira: 'A', tipo: 'RF', quantidade: 1, precoEntrada: 22948.87, precoAtual: 22948.87, currency: 'BRL', corretora: 'XP', dataCompra: refDate },
    { ticker: 'LFT-2029', name: 'Tesouro Selic 2029', carteira: 'A', tipo: 'RF', quantidade: 1, precoEntrada: 64699.37, precoAtual: 64699.37, currency: 'BRL', corretora: 'Tesouro Direto', dataCompra: refDate },

    // Cripto — USD (preço médio não informado: igual ao atual; ajuste no app se quiser P/L por custo)
    { ticker: 'SOL', name: 'Solana', carteira: 'B', tipo: 'Cripto', quantidade: 78.48, precoEntrada: 85.19, precoAtual: 85.19, currency: 'USD', corretora: 'Exchange', dataCompra: refDate },
    { ticker: 'BTC', name: 'Bitcoin', carteira: 'B', tipo: 'Cripto', quantidade: 0.0805, precoEntrada: 68000, precoAtual: 68000, currency: 'USD', corretora: 'Exchange', dataCompra: refDate },
    { ticker: 'LTC', name: 'Litecoin', carteira: 'B', tipo: 'Cripto', quantidade: 37.32, precoEntrada: 54.59, precoAtual: 54.59, currency: 'USD', corretora: 'Exchange', dataCompra: refDate },
    { ticker: 'ETH', name: 'Ethereum', carteira: 'B', tipo: 'Cripto', quantidade: 0.7374, precoEntrada: 2001, precoAtual: 2001, currency: 'USD', corretora: 'Exchange', dataCompra: refDate },
    { ticker: 'HBAR', name: 'Hedera', carteira: 'B', tipo: 'Cripto', quantidade: 7141.69, precoEntrada: 0.1016, precoAtual: 0.1016, currency: 'USD', corretora: 'Exchange', dataCompra: refDate },
    { ticker: 'LINK', name: 'Chainlink', carteira: 'B', tipo: 'Cripto', quantidade: 38.2696, precoEntrada: 8.89, precoAtual: 8.89, currency: 'USD', corretora: 'Exchange', dataCompra: refDate },

    // EUA — preço médio / preço atual (USD)
    { ticker: 'SMH', name: 'VanEck Semiconductors ETF', carteira: 'A', tipo: 'ETF USA', quantidade: 3.24, precoEntrada: 246, precoAtual: 409.15, currency: 'USD', corretora: 'Avenue', dataCompra: refDate },
    { ticker: 'SLV', name: 'iShares Silver Trust', carteira: 'A', tipo: 'ETF USA', quantidade: 14.43, precoEntrada: 27.72, precoAtual: 66.98, currency: 'USD', corretora: 'Avenue', dataCompra: refDate },
    { ticker: 'GLD', name: 'SPDR Gold Trust', carteira: 'A', tipo: 'ETF USA', quantidade: 1.63, precoEntrada: 244.15, precoAtual: 462.62, currency: 'USD', corretora: 'Avenue', dataCompra: refDate },
    { ticker: 'JPM', name: 'JPMorgan Chase', carteira: 'A', tipo: 'Ação USA', quantidade: 2.017, precoEntrada: 223.02, precoAtual: 306.71, currency: 'USD', corretora: 'Avenue', dataCompra: refDate },
  ];

  let createdCount = 0;
  for (const asset of assets) {
    await prisma.asset.create({
      data: {
        ...asset,
        userId: user.id
      }
    });
    createdCount++;
  }
  
  console.log(`✅ ${createdCount} ativos criados\n`);

  const alertsData = [
    { ticker: 'BTC', tipo: 'preco', condicao: '>', valorGatilho: 95000, acaoSugerida: 'Reavaliar realização parcial' },
    { ticker: 'BTC', tipo: 'preco', condicao: '<', valorGatilho: 55000, acaoSugerida: 'Revisar stop / aporte' },
    { ticker: 'ETH', tipo: 'preco', condicao: '>', valorGatilho: 2800, acaoSugerida: 'Reavaliar realização' },
    { ticker: 'PRIO3', tipo: 'percentual', condicao: '>', valorGatilho: 25, acaoSugerida: 'Realizar parte da posição' },
    { ticker: 'PETR4', tipo: 'preco', condicao: '>', valorGatilho: 38, acaoSugerida: 'Reavaliar preço-alvo' },
  ];

  for (const alertData of alertsData) {
    const asset = await prisma.asset.findFirst({
      where: { 
        userId: user.id,
        ticker: alertData.ticker 
      }
    });

    if (asset) {
      await prisma.alert.create({
        data: {
          userId: user.id,
          assetId: asset.id,
          tipo: alertData.tipo,
          condicao: alertData.condicao,
          valorGatilho: alertData.valorGatilho,
          acaoSugerida: alertData.acaoSugerida
        }
      });
    }
  }
  
  console.log(`✅ ${alertsData.length} alertas criados\n`);
  console.log('🎉 Seed completo!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });