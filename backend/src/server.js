require('dotenv').config();

const { getJwtSecret } = require('./config/jwt');

try {
  getJwtSecret();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const { logger } = require('./utils/logger');
const { startPriceUpdateCron } = require('./services/priceUpdater');
const { startAlertCheckCron } = require('./services/alertChecker');

const prisma = require('./lib/prisma');
const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const alertsRoutes = require('./routes/alerts');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function healthJson() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
}

app.get('/health', (req, res) => {
  res.json(healthJson());
});

app.get('/api/health', (req, res) => {
  res.json(healthJson());
});

async function healthDbHandler(req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('[health/db]', err);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      code: err.code,
      message: err.message
    });
  }
}

app.get('/health/db', healthDbHandler);
app.get('/api/health/db', healthDbHandler);

app.get('/api', (req, res) => {
  res.json({
    name: 'Portfolio Commander API',
    routes: {
      health: 'GET /health ou GET /api/health',
      healthDb: 'GET /health/db ou GET /api/health/db',
      login: 'POST /api/auth/login',
      assets: 'GET /api/assets',
      alerts: 'GET /api/alerts',
      notifications: 'GET /api/notifications'
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Portfolio Commander API',
    message: 'Rotas REST usam o prefixo /api (ex.: /api/auth/login). Health: /health ou /api/health.',
    health: '/health',
    healthDb: '/health/db',
    examples: {
      login: 'POST /api/auth/login',
      assets: 'GET /api/assets (requer Authorization: Bearer …)'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    hint:
      'GET / ou GET /api para ver rotas. Health: /health (não /api só). Login: POST /api/auth/login. Teste DB: GET /health/db'
  });
});

app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🕐 Timezone: ${process.env.TZ}`);
  console.log('=================================');

  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Frontend URL: ${process.env.FRONTEND_URL}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🕐 Timezone: ${process.env.TZ}`);

  startPriceUpdateCron();
  startAlertCheckCron();
});
