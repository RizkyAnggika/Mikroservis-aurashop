const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Koneksi database berhasil');
  } catch (err) {
    console.error('❌ Koneksi database gagal:', err.message);
  }
})();

module.exports = db;
