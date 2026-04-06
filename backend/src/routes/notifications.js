const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { parseIdParam } = require('../utils/numbers');
const { logger } = require('../utils/logger');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(notifications);
  } catch (error) {
    logger.error('GET /notifications:', error);
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        lida: false
      },
      data: { lida: true }
    });

    res.json({ message: 'Todas notificações marcadas como lidas' });
  } catch (error) {
    logger.error('PUT /notifications/read-all:', error);
    res.status(500).json({ error: 'Erro ao atualizar notificações' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const id = parseIdParam(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId: req.user.id
      },
      data: { lida: true }
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    logger.error('PUT /notifications/:id/read:', error);
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
});

module.exports = router;
