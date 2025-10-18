const db = require('../config/db');

const Order = {
  // 🟢 Buat pesanan baru
  create: (data, callback) => {
    const query = `
      INSERT INTO orders (userId, customer_name, items, totalPrice, note, order_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    db.query(
      query,
      [
        data.userId,
        data.customer_name,
        JSON.stringify(data.items), // simpan sebagai JSON string
        data.totalPrice,
        data.note,
        data.order_status,
      ],
      callback
    );
  },

  // 🔵 Ambil semua pesanan
  findAll: (callback) => {
    db.query('SELECT * FROM orders ORDER BY created_at DESC', callback);
  },

  // 🟣 Ambil pesanan berdasarkan ID
  findById: (id, callback) => {
    db.query('SELECT * FROM orders WHERE id = ?', [id], callback);
  },

  // 🟢 Ambil semua pesanan berdasarkan userId (riwayat per user)
  findByUserId: (userId, callback) => {
    db.query(
      'SELECT * FROM orders WHERE userId = ? ORDER BY created_at DESC',
      [userId],
      callback
    );
  },

  // 🟣 Ambil semua pesanan berdasarkan status (paid, pending, canceled, dll)
  findByStatus: (status, callback) => {
    db.query(
      'SELECT * FROM orders WHERE order_status = ? ORDER BY created_at DESC',
      [status],
      callback
    );
  },

  // 🟠 Update status pesanan
  updateStatus: (id, status, callback) => {
    db.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [status, id],
      callback
    );
  },

  // 🔴 Hapus pesanan
  delete: (id, callback) => {
    db.query('DELETE FROM orders WHERE id = ?', [id], callback);
  },
};

module.exports = Order;
