// src/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

// 🧩 Middleware
app.use(cors());
app.use(express.json());

// 🛣️ Routes
app.use('/api/orders', orderRoutes);

// 🗄️ Jalankan koneksi database & server
const startServer = async () => {
  try {
    await connectDB(); // termasuk test koneksi + sync model di dalamnya

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Order Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
