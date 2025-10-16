const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',          // nanti ganti IP temanmu kalau beda device
  user: 'root',
  password: '',               // samain dengan MySQL temen kamu
  database: 'aurashop_inventory',
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ MySQL Connected to aurashop_inventory');
  }
});

module.exports = db;
