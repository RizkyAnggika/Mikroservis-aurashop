// 📁 config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aurashop_inventory',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Pool connected to database:', process.env.DB_NAME);
    connection.release();
  } catch (err) {
    console.error('❌ Gagal konek ke MySQL:', err.message);
  }
})();

module.exports = pool;
