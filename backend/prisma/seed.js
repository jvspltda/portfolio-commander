const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  const passwordHash = await bcrypt.hash('dick1010', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'jvsp.ltda2@gmail.com' },
    update: {},
    create: {
      email: 'jvsp.ltda2@gmail.com',
      password: passwordHash,
      name: 'João Victor'
    }
  });
  
  console.log('✅ Usuário criado:', user.email);

  await prisma.asset.deleteMany({
    where: { userId: user.id }
  });
  console.log('🗑️  Ativos anteriores removidos\n');

  const assets = [
    { ticker: 'Tesouro Pré 2031', name: 'Tesouro Prefixado 2031', carteira: 'A', tipo: 'RF', 
      quantidade: 1, precoEntrada: 80000, precoAtual: 80000, currency: 'BRL', corretora: 'Tesouro Direto' },
    { ticker: 'CDB 112% CDI', name: 'CDB 112% do CDI', carteira: 'A', tipo: 'RF',
      quantidade: 1, precoEntrada: 80000, precoAtual: 80000, currency: 'BRL', corretora: 'XP' },
    { ticker: 'IPCA+ 2035', name: 'Tesouro IPCA+ 2035', carteira: 'A', tipo: 'RF',
      quantidade: 1, precoEntrada: 56000, precoAtual: 56000, currency: 'BRL', corretora: 'Tesouro Direto' },
    { ticker: 'PRIO3', name: 'PRIO - Petróleo Brasileiro', carteira: 'A', tipo: 'Ação BR',
      quantidade: 2033, precoEntrada: 39.35, precoAtual: 39.35, currency: 'BRL', corretora: 'XP' },
    { ticker: 'SMAL11', name: 'SMAL11 - Small Caps', carteira: 'A', tipo: 'ETF BR',
      quantidade: 493, precoEntrada: 113.54, precoAtual: 113.54, currency: 'BRL', corretora: 'XP' },
    { ticker: 'CCJ', name: 'Cameco - Urânio', carteira: 'A', tipo: 'Ação USA',
      quantidade: 160, precoEntrada: 91.27, precoAtual: 91.27, currency: 'USD', corretora: 'Avenue' },
    { ticker: 'SMH', name: 'VanEck Semiconductors', carteira: 'A', tipo: 'ETF USA',
      quantidade: 40, precoEntrada: 368.55, precoAtual: 368.55, currency: 'USD', corretora: 'Avenue' },
    { ticker: 'COPX', name: 'Global X Copper', carteira: 'A', tipo: 'ETF USA',
      quantidade: 88, precoEntrada: 68.01, precoAtual: 68.01, currency: 'USD', corretora: 'Avenue' },
    { ticker: 'QQQ', name: 'Invesco QQQ', carteira: 'A', tipo: 'ETF USA',
      quantidade: 104, precoEntrada: 539, precoAtual: 539, currency: 'USD', corretora: 'Avenue' },
    { ticker: 'VT', name: 'Vanguard Total World', carteira: 'A', tipo: 'ETF USA',
      quantidade: 170, precoEntrada: 141.13, precoAtual: 141.13, currency: 'USD', corretora: 'Avenue' },
    { ticker: 'GLD', name: 'SPDR Gold Trust', carteira: 'A', tipo: 'Ouro',
      quantidade: 38, precoEntrada: 385.36, precoAtual: 385.36, currency: 'USD', corretora: 'Avenue' },
    { ticker: 'DBMF', name: 'iMGP DBi Managed Futures', carteira: 'A', tipo: 'CTAs',
      quantidade: 2080, precoEntrada: 26.92, precoAtual: 26.92, currency: 'USD', corretora: 'Avenue' },
    { ticker: 'TLT', name: 'iShares Treasury 20+', carteira: 'A', tipo: 'Treasuries',
      quantidade: 182, precoEntrada: 87.88, precoAtual: 87.88, currency: 'USD', corretora: 'Avenue' },
    { ticker: 'BTC', name: 'Bitcoin', carteira: 'B', tipo: 'Cripto',
      quantidade: 0.244, precoEntrada: 89000, precoAtual: 90200, currency: 'USD', corretora: 'Binance' },
    { ticker: 'ETH', name: 'Ethereum', carteira: 'B', tipo: 'Cripto',
      quantidade: 1.42, precoEntrada: 3100, precoAtual: 3150, currency: 'USD', corretora: 'Binance' },
    { ticker: 'SOL', name: 'Solana', carteira: 'B', tipo: 'Cripto',
      quantidade: 20, precoEntrada: 145, precoAtual: 148, currency: 'USD', corretora: 'Binance' },
    { ticker: 'FET', name: 'Fetch.ai', carteira: 'B', tipo: 'Cripto',
      quantidade: 735, precoEntrada: 2.0, precoAtual: 2.1, currency: 'USD', corretora: 'Binance' },
    { ticker: 'RENDER', name: 'Render Network', carteira: 'B', tipo: 'Cripto',
      quantidade: 195, precoEntrada: 7.5, precoAtual: 7.8, currency: 'USD', corretora: 'Binance' },
    { ticker: 'ONDO', name: 'Ondo Finance', carteira: 'B', tipo: 'Cripto',
      quantidade: 1625, precoEntrada: 0.90, precoAtual: 0.92, currency: 'USD', corretora: 'Binance' },
    { ticker: 'TAO', name: 'Bittensor', carteira: 'B', tipo: 'Cripto',
      quantidade: 4, precoEntrada: 275, precoAtual: 280, currency: 'USD', corretora: 'Binance' },
    { ticker: 'OLAS', name: 'Autonolas', carteira: 'B', tipo: 'Cripto',
      quantidade: 1667, precoEntrada: 1.20, precoAtual: 1.22, currency: 'USD', corretora: 'Binance' },
    { ticker: 'ARKM', name: 'Arkham', carteira: 'B', tipo: 'Cripto',
      quantidade: 1111, precoEntrada: 1.80, precoAtual: 1.85, currency: 'USD', corretora: 'Binance' },
    { ticker: 'AZERO', name: 'Aleph Zero', carteira: 'B', tipo: 'Cripto',
      quantidade: 4000, precoEntrada: 0.50, precoAtual: 0.51, currency: 'USD', corretora: 'Binance' },
    { ticker: 'HNT', name: 'Helium', carteira: 'B', tipo: 'Cripto',
      quantidade: 400, precoEntrada: 5.00, precoAtual: 5.20, currency: 'USD', corretora: 'Binance' },
    { ticker: 'MAGIC', name: 'Treasure DAO', carteira: 'B', tipo: 'Cripto',
      quantidade: 2500, precoEntrada: 0.80, precoAtual: 0.82, currency: 'USD', corretora: 'Binance' },
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
    { ticker: 'BTC', tipo: 'preco', condicao: '>', valorGatilho: 130000, acaoSugerida: 'Vender 20%' },
    { ticker: 'BTC', tipo: 'preco', condicao: '<', valorGatilho: 70000, acaoSugerida: 'STOP LOSS - Vender 30%' },
    { ticker: 'PRIO3', tipo: 'percentual', condicao: '>', valorGatilho: 30, acaoSugerida: 'Realizar 20%' },
    { ticker: 'ETH', tipo: 'preco', condicao: '>', valorGatilho: 5000, acaoSugerida: 'Vender 30%' },
    { ticker: 'CCJ', tipo: 'preco', condicao: '>', valorGatilho: 120, acaoSugerida: 'Realizar 30%' },
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