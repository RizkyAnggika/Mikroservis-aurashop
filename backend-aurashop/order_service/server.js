require('dotenv').config();
<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const orderRoutes = require('./src/routes/orderRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const db = require('./src/config/db'); // langsung pakai koneksi mysql2

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/orders', orderRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
});
=======
const db = require('./src/config/db'); // 🔹 langsung impor koneksi
const app = require('./src/app'); // modular app

const PORT = process.env.PORT || 5001;

// 🔹 Start server
const startServer = () => {
  try {
    // Pastikan MySQL sudah connect dulu
    db.connect((err) => {
      if (err) {
        console.error('❌ Gagal konek ke database:', err.message);
        process.exit(1);
      } else {
        console.log('✅ Database connected successfully');
        app.listen(PORT, () => {
          console.log(`🚀 Order Service running on port ${PORT}`);
        });
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
>>>>>>> f661b9835616ba06ffa3ed8fa44e74d8210df073
