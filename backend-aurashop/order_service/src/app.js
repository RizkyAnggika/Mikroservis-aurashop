const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // koneksi MySQL
const orderRoutes = require('./routes/orderRoutes'); // kalau ada
const errorHandler = require('./middleware/errorHandler'); // kalau ada

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);

// Error handler (opsional)
app.use(errorHandler);

module.exports = app;
