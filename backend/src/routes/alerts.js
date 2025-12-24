const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// GET /api/alerts
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
    res.status(500).json({ error: error.message });
  }
});

// POST /api/alerts
router.post('/', async (req, res) => {
  try {
    const { assetId, tipo, condicao, valorGatilho, acaoSugerida, notificarEmail } = req.body;
    
    if (!assetId || !tipo || !condicao || !valorGatilho || !acaoSugerida) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    
    const asset = await prisma.asset.findFirst({
      where: {
        id: parseInt(assetId),
        userId: req.user.id
      }
    });
    
    if (!asset) {
      return res.status(404).json({ error: 'Ativo não encontrado' });
    }
    
    const alert = await prisma.alert.create({
      data: {
        userId: req.user.id,
        assetId: parseInt(assetId),
        tipo,
        condicao,
        valorGatilho: parseFloat(valorGatilho),
        acaoSugerida,
        notificarEmail: notificarEmail || false
      }
    });
    
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/alerts/:id/toggle
router.put('/:id/toggle', async (req, res) => {
  try {
    const alert = await prisma.alert.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      }
    });
    
    if (!alert) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }
    
    const updated = await prisma.alert.update({
      where: { id: parseInt(req.params.id) },
      data: { ativo: !alert.ativo }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.alert.deleteMany({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      }
    });
    
    if (result.count === 0) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }
    
    res.json({ message: 'Alerta removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
