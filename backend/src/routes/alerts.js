const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { parseIdParam, parseFiniteNumber } = require('../utils/numbers');
const { logger } = require('../utils/logger');

const router = express.Router();

const ALLOWED_CONDICOES = ['>', '<', '>=', '<='];
const ALLOWED_TIPOS = ['preco', 'percentual', 'alocacao'];

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id },
      include: {
        asset: {
          select: {
            ticker: true,
            name: true,
            precoAtual: true,
            currency: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(alerts);
  } catch (error) {
    logger.error('GET /alerts:', error);
    res.status(500).json({ error: 'Erro ao listar alertas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { assetId, tipo, condicao, valorGatilho, acaoSugerida, notificarEmail } = req.body;

    if (!assetId || !tipo || !condicao || valorGatilho === undefined || !acaoSugerida) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    if (!ALLOWED_CONDICOES.includes(condicao)) {
      return res.status(400).json({ error: 'Condição inválida' });
    }

    if (!ALLOWED_TIPOS.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de alerta inválido' });
    }

    const aid = parseIdParam(assetId);
    if (!aid) {
      return res.status(400).json({ error: 'Ativo inválido' });
    }

    const vg = parseFiniteNumber(valorGatilho);
    if (vg === null) {
      return res.status(400).json({ error: 'Valor de gatilho inválido' });
    }

    const asset = await prisma.asset.findFirst({
      where: {
        id: aid,
        userId: req.user.id
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Ativo não encontrado' });
    }

    const alert = await prisma.alert.create({
      data: {
        userId: req.user.id,
        assetId: aid,
        tipo,
        condicao,
        valorGatilho: vg,
        acaoSugerida,
        notificarEmail: Boolean(notificarEmail)
      }
    });

    res.status(201).json(alert);
  } catch (error) {
    logger.error('POST /alerts:', error);
    res.status(500).json({ error: 'Erro ao criar alerta' });
  }
});

router.put('/:id/toggle', async (req, res) => {
  try {
    const id = parseIdParam(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const alert = await prisma.alert.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: { ativo: !alert.ativo }
    });

    res.json(updated);
  } catch (error) {
    logger.error('PUT /alerts/:id/toggle:', error);
    res.status(500).json({ error: 'Erro ao alternar alerta' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseIdParam(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await prisma.alert.deleteMany({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }

    res.json({ message: 'Alerta removido com sucesso' });
  } catch (error) {
    logger.error('DELETE /alerts/:id:', error);
    res.status(500).json({ error: 'Erro ao remover alerta' });
  }
});

module.exports = router;
