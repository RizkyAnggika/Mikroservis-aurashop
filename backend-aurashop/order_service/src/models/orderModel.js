const db = require('../config/db');

const Order = {
  create: (orderData, callback) => {
    const query = 'INSERT INTO orders (userId, items, totalPrice, status) VALUES (?, ?, ?, ?)';
    db.query(query, [
      orderData.userId,
      JSON.stringify(orderData.items),
      orderData.totalPrice,
      orderData.status || 'pending'
    ], callback);
  },

  findAll: (callback) => {
    db.query('SELECT * FROM orders', callback);
  },

  findById: (id, callback) => {
    db.query('SELECT * FROM orders WHERE id = ?', [id], callback);
  },

  updateStatus: (id, status, callback) => {
    db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM orders WHERE id = ?', [id], callback);
  },
};

module.exports = Order;
