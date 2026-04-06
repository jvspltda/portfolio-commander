const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { updateAllPrices } = require('../services/priceUpdater');
const { checkAllAlerts } = require('../services/alertChecker');
const { USD_BRL } = require('../utils/constants');
const { parseIdParam, parseFiniteNumber } = require('../utils/numbers');
const { logger } = require('../utils/logger');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        userId: req.user.id,
        ativo: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(assets);
  } catch (error) {
    logger.error('GET /assets:', error);
    res.status(500).json({ error: 'Erro ao listar ativos' });
  }
});

router.get('/portfolio/summary', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        userId: req.user.id,
        ativo: true
      }
    });

    let totalA = 0;
    let totalB = 0;
    let investidoA = 0;
    let investidoB = 0;

    assets.forEach((a) => {
      const valorAtual = a.quantidade * a.precoAtual * (a.currency === 'USD' ? USD_BRL : 1);
      const valorEntrada = a.quantidade * a.precoEntrada * (a.currency === 'USD' ? USD_BRL : 1);

      if (a.carteira === 'A') {
        totalA += valorAtual;
        investidoA += valorEntrada;
      } else {
        totalB += valorAtual;
        investidoB += valorEntrada;
      }
    });

    res.json({
      totalA,
      totalB,
      total: totalA + totalB,
      investidoA,
      investidoB,
      investidoTotal: investidoA + investidoB,
      lucroA: totalA - investidoA,
      lucroB: totalB - investidoB,
      lucroTotal: totalA + totalB - (investidoA + investidoB),
      numAtivos: assets.length
    });
  } catch (error) {
    logger.error('GET /assets/portfolio/summary:', error);
    res.status(500).json({ error: 'Erro ao calcular resumo' });
  }
});

router.post('/update-prices', async (req, res) => {
  try {
    const result = await updateAllPrices(req.user.id);
    try {
      await checkAllAlerts();
    } catch (alertErr) {
      logger.error('checkAllAlerts após update-prices:', alertErr);
    }
    res.json({
      success: true,
      message: `${result.updated} preços atualizados, ${result.failed} falharam`,
      updated: result.updated,
      failed: result.failed
    });
  } catch (error) {
    logger.error('POST /assets/update-prices:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar preços'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { ticker, name, carteira, tipo, quantidade, precoEntrada, precoAtual, currency, corretora } =
      req.body;

    if (!ticker || !carteira || !tipo || quantidade === undefined || precoEntrada === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const q = parseFiniteNumber(quantidade, { min: 0 });
    const pe = parseFiniteNumber(precoEntrada, { min: 0 });
    if (q === null || q <= 0 || pe === null || pe < 0) {
      return res.status(400).json({ error: 'Quantidade e preços devem ser números válidos' });
    }

    let pa = pe;
    if (precoAtual !== undefined && precoAtual !== null && precoAtual !== '') {
      const parsed = parseFiniteNumber(precoAtual, { min: 0 });
      if (parsed === null) {
        return res.status(400).json({ error: 'Preço atual inválido' });
      }
      pa = parsed;
    }

    const asset = await prisma.asset.create({
      data: {
        userId: req.user.id,
        ticker: String(ticker).toUpperCase().trim(),
        name,
        carteira,
        tipo,
        quantidade: q,
        precoEntrada: pe,
        precoAtual: pa,
        currency: currency || 'BRL',
        corretora
      }
    });

    res.status(201).json(asset);
  } catch (error) {
    logger.error('POST /assets:', error);
    res.status(500).json({ error: 'Erro ao criar ativo' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseIdParam(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const asset = await prisma.asset.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 30
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Ativo não encontrado' });
    }

    res.json(asset);
  } catch (error) {
    logger.error('GET /assets/:id:', error);
    res.status(500).json({ error: 'Erro ao buscar ativo' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseIdParam(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const { quantidade, precoAtual, corretora } = req.body;

    const updateData = {};
    if (quantidade !== undefined) {
      const q = parseFiniteNumber(quantidade, { min: 0 });
      if (q === null || q <= 0) {
        return res.status(400).json({ error: 'Quantidade inválida' });
      }
      updateData.quantidade = q;
    }
    if (precoAtual !== undefined) {
      const p = parseFiniteNumber(precoAtual, { min: 0 });
      if (p === null) {
        return res.status(400).json({ error: 'Preço atual inválido' });
      }
      updateData.precoAtual = p;
    }
    if (corretora !== undefined) updateData.corretora = corretora;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    const asset = await prisma.asset.updateMany({
      where: {
        id,
        userId: req.user.id
      },
      data: updateData
    });

    if (asset.count === 0) {
      return res.status(404).json({ error: 'Ativo não encontrado' });
    }

    res.json({ message: 'Ativo atualizado com sucesso' });
  } catch (error) {
    logger.error('PUT /assets/:id:', error);
    res.status(500).json({ error: 'Erro ao atualizar ativo' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseIdParam(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const asset = await prisma.asset.updateMany({
      where: {
        id,
        userId: req.user.id
      },
      data: { ativo: false }
    });

    if (asset.count === 0) {
      return res.status(404).json({ error: 'Ativo não encontrado' });
    }

    res.json({ message: 'Ativo removido com sucesso' });
  } catch (error) {
    logger.error('DELETE /assets/:id:', error);
    res.status(500).json({ error: 'Erro ao remover ativo' });
  }
});

module.exports = router;
