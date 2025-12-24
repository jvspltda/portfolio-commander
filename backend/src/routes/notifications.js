const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      data: { lida: true }
    });
    
    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }
    
    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/read-all
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;