const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { getJwtSecret } = require('../config/jwt');
const { isAllowedUserEmail, getAllowedUserEmail } = require('../config/singleUser');
const { logger } = require('../utils/logger');

const router = express.Router();

function loginErrorResponse(error) {
  const prismaCode = error.code ?? error.errorCode;
  const name = error.name || '';
  const msg = String(error.message || '');

  logger.error(`Erro no login: ${error.message}`);
  console.error('[auth/login]', name, prismaCode, error.message);

  const unreachable =
    prismaCode === 'P1001' ||
    prismaCode === 'P1000' ||
    /Can't reach database server/i.test(msg);

  if (unreachable) {
    return {
      status: 503,
      body: {
        error:
          'Não foi possível conectar ao banco (rede/host). No Supabase: projeto ativo (não pausado), URI Direct e ?sslmode=require. No Railway: DATABASE_URL igual à do painel.',
        code: prismaCode || 'P1001'
      }
    };
  }
  if (prismaCode === 'P1017') {
    return {
      status: 503,
      body: {
        error: 'Conexão com o banco foi encerrada. Tente de novo ou revise o pooler do Supabase.',
        code: prismaCode
      }
    };
  }
  if (name === 'PrismaClientInitializationError') {
    return {
      status: 503,
      body: {
        error:
          'Prisma não conseguiu conectar ao banco. No Railway: confira DATABASE_URL (URI Direct do Supabase, sslmode=require), rede do projeto e se o build rodou prisma migrate deploy.',
        code: prismaCode || name
      }
    };
  }

  return {
    status: 500,
    body: {
      error: 'Erro no servidor',
      ...(prismaCode && { code: prismaCode })
    }
  };
}

router.post('/login', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Envie JSON com o campo email' });
    }

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
    const { status, body } = loginErrorResponse(error);
    res.status(status).json(body);
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
