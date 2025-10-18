require('dotenv').config();
const mysql = require('mysql2');

// 🧩 Gunakan pool biar koneksi otomatis dikelola
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aurashop_inventory',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // 🔢 maksimal koneksi bersamaan
  queueLimit: 0,
});

// 🧠 Tes koneksi awal
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Gagal konek ke MySQL:', err.message);
  } else {
    console.log('✅ MySQL Pool connected to database:', process.env.DB_NAME);
    connection.release();
  }
});

// Export pool biar bisa pakai async/await dengan promise wrapper
module.exports = pool.promise();
