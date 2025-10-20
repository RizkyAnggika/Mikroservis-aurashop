require('dotenv').config();
const chalk = require('chalk');
const db = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5001;

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});

const startServer = () => {
  try {
    db.ping((err) => {
      if (err) {
        console.error(chalk.red('❌ Gagal konek ke database:'), err.message);
        process.exit(1);
      } else {
        console.log(chalk.green('✅ Database connected successfully'));
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

        app.listen(PORT, () => {
          console.log(chalk.blue(`🚀 Order Service running on port ${PORT}`));
        });
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
