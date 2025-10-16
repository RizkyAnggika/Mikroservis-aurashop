require('dotenv').config();
const db = require('./src/config/db'); // 🔹 langsung impor koneksi
const app = require('./src/app'); // modular app

const PORT = process.env.PORT || 5001;

// 🔹 koneksi MySQL sudah otomatis dibuat di config/db.js
const startServer = () => {
  try {
    app.listen(PORT, () => console.log(`🚀 Order Service running on port ${PORT}`));
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();