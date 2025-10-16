const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',          // nanti ganti IP temanmu kalau beda device
  user: 'root',
<<<<<<< HEAD
  password: '',               // samain dengan MySQL temen kamu
=======
  password: '',
>>>>>>> f661b9835616ba06ffa3ed8fa44e74d8210df073
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
