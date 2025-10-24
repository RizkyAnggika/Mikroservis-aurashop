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

// Tes koneksi awal dengan retry (biar gak langsung gagal di Docker)
const testConnection = async (retries = 10, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log(`✅ MySQL Pool connected to database: ${process.env.DB_NAME}`);
      connection.release();
      return;
    } catch (err) {
      console.log(`⚠️  MySQL belum siap (percobaan ${i}/${retries})`);
      if (i === retries) {
        console.error('❌ Gagal konek ke MySQL setelah beberapa kali percobaan:', err.message);
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

testConnection();

module.exports = pool;
