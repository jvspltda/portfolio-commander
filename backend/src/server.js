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

const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const alertsRoutes = require('./routes/alerts');
const notificationsRoutes = require('./routes/notifications');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Portfolio Commander API',
    message: 'As rotas da aplicação ficam sob o prefixo /api',
    health: '/health',
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
    hint: 'Início: GET / ou GET /health. API: /api/auth, /api/assets, /api/alerts, /api/notifications'
  });
});

app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

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
