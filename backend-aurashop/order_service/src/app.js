const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'order_service' });
});

// Routes
app.use('/api/orders', orderRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
