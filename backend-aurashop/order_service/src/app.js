const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Logger (opsional tapi berguna)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: '🚀 Order Service API is running' });
});

// Routes utama
app.use('/api/orders', orderRoutes);
app.use('/api/orders', paymentRoutes); // bisa diganti ke '/api/payments' kalau mau dipisah

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl,
  });
});

// Error handler global
app.use(errorHandler);

module.exports = app;
