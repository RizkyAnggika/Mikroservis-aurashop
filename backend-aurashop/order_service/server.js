require('dotenv').config();
const db = require('./src/config/db'); // 🔹 Koneksi MySQL (langsung jalan)
const app = require('./src/app'); // 🔹 Import express app

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
