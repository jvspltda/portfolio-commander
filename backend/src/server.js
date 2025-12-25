require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logger } = require('./utils/logger');

const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const alertsRoutes = require('./routes/alerts');
const notificationsRoutes = require('./routes/notifications');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (SEM /api)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rotas da API (COM /api)
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
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
});