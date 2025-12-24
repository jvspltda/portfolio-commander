require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const alertsRoutes = require('./routes/alerts');
const notificationsRoutes = require('./routes/notifications');

const { updateAllPrices } = require('./services/priceUpdater');
const { checkAllAlerts } = require('./services/alertChecker');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Cron Jobs
// Atualiza preços todo dia às 9h (seg-sex)
cron.schedule('0 9 * * 1-5', async () => {
  logger.info('🔄 Iniciando atualização de preços...');
  try {
    await updateAllPrices();
    logger.info('✅ Preços atualizados com sucesso');
  } catch (error) {
    logger.error('❌ Erro ao atualizar preços:', error);
  }
}, {
  timezone: "America/Sao_Paulo"
});

// Verifica alertas a cada 30 minutos
cron.schedule('*/30 * * * *', async () => {
  logger.info('🔔 Verificando alertas...');
  try {
    await checkAllAlerts();
    logger.info('✅ Alertas verificados');
  } catch (error) {
    logger.error('❌ Erro ao verificar alertas:', error);
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Frontend URL: ${process.env.FRONTEND_URL}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🕐 Timezone: ${process.env.TZ}`);
});