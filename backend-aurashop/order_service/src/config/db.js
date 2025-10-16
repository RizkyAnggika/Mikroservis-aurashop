const mysql = require('mysql2');

const connectDB = () => {
  const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aurashop_inventory',
  });

  db.connect((err) => {
    if (err) {
      console.error('❌ Database connection error:', err);
      throw err;
    } else {
      console.log('✅ MySQL Connected to aurashop_inventory');
    }
  });

  return db;
};

module.exports = { connectDB };
