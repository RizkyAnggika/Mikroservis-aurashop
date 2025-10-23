const db = require('../config/db');

const Product = {
  getAll: (callback) => {
    db.query('SELECT * FROM products', callback);
  },
    setImage: (id, buffer, cb) => {
    const sql = 'UPDATE products SET gambar = ? WHERE id = ?';
    db.query(sql, [buffer, id], cb);
  },

  getImage: (id, cb) => {
    const sql = 'SELECT gambar FROM products WHERE id = ?';
    db.query(sql, [id], (err, rows) => {
      if (err) return cb(err);
      if (!rows.length || !rows[0].gambar) return cb(null, null);
      cb(null, rows[0].gambar); // Buffer
    });
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], callback);
  },

  create: (data, callback) => {
    db.query('INSERT INTO products SET ?', data, callback);
  },

  update: (id, data, callback) => {
    db.query('UPDATE products SET ? WHERE id = ?', [data, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM products WHERE id = ?', [id], callback);
  }, 

  reduceStock: (id, quantity, callback) => {
    const sql = 'UPDATE products SET stok = stok - ? WHERE id = ? AND stok >= ?';
    db.query(sql, [quantity, id, quantity], callback);
  },
};



module.exports = Product;
