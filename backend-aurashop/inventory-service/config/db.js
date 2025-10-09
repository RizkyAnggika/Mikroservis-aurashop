const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // ubah sesuai user SQLyog kamu
  password: '', // isi password MySQL kamu
  database: 'aurashop_inventory'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ MySQL Connected to aurashop_inventory');
  }
});

module.exports = db;
