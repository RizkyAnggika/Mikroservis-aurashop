require('dotenv').config();
const { connectDB } = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB(); // Tes koneksi + sync
    app.listen(PORT, () => console.log(`🚀 Order Service running on port ${PORT}`));
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
