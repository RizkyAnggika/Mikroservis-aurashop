const mysql = require('mysql2');
require('dotenv').config(); // 🔹 Load .env file

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log(`✅ MySQL Connected to ${process.env.DB_NAME} (${process.env.DB_HOST})`);
  }
});

module.exports = db;
