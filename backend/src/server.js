require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logger } = require('./utils/logger');
const { startPriceUpdateCron } = require('./services/priceUpdater');

const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const alertsRoutes = require('./routes/alerts');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🕐 Timezone: ${process.env.TZ}`);
  console.log('=================================');
  
  startPriceUpdateCron();
});
