const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // samakan dengan punya inventory_service
  database: 'aurashop_inventory', // pakai database yang sama
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ MySQL Connected to aurashop_inventory');
  }
});

module.exports = db;
