const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check (buat ngecek status service)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'order_service' });
});

// Routes utama
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes); // 🔧 lebih spesifik endpoint-nya

// Error Handler (taruh paling bawah)
app.use(errorHandler);

module.exports = app;
