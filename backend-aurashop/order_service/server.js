const express = require('express');
const { connectDB } = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Tes koneksi database
connectDB();

// Gunakan route
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
