require('dotenv').config();
const db = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5001;

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});

const startServer = () => {
  try {
    (async () => {
      try {
        await db.query('SELECT 1');
        console.log('✅ Database connected successfully');
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

        app.listen(PORT, () => {
          console.log(`🚀 Order Service running on port ${PORT}`);
        });
      } catch (err) {
        console.error('❌ Gagal konek ke database:', err.message);
        process.exit(1);
      }
    })();
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
