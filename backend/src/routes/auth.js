const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { getJwtSecret } = require('../config/jwt');
const { isAllowedUserEmail, getAllowedUserEmail } = require('../config/singleUser');
const { logger } = require('../utils/logger');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'E-mail é obrigatório'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!isAllowedUserEmail(normalizedEmail)) {
      return res.status(401).json({
        error: 'Acesso não autorizado'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado. Execute o seed do banco (npm run seed).'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    logger.error(`Erro no login: ${error.message}`);
    res.status(500).json({
      error: 'Erro no servidor'
    });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const allowed = getAllowedUserEmail();
    if (user.email.trim().toLowerCase() !== allowed) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
