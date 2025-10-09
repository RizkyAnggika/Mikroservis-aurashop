// src/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.DB_NAME || !process.env.DB_USER) {
  throw new Error('❌ Missing database environment variables!');
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected');

    // otomatis sinkron model
    await sequelize.sync({ alter: true });
    console.log('✅ Database & models synchronized');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
