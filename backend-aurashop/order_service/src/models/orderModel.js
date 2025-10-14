// 📁 src/models/paymentModel.js
const db = require('../config/db');

const Payment = {
  // 🟢 Buat pembayaran baru
  create: (paymentData, callback) => {
    const query = `
      INSERT INTO payments (orderId, paymentMethod, amount, status)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [
      paymentData.orderId,
      paymentData.paymentMethod,
      paymentData.amount,
      paymentData.status || 'success',
    ], callback);
  },

  // 🔵 Ambil semua pembayaran
  findAll: (callback) => {
    db.query('SELECT * FROM payments', callback);
  },

  // 🟣 Ambil pembayaran berdasarkan ID
  findById: (id, callback) => {
    db.query('SELECT * FROM payments WHERE id = ?', [id], callback);
  },

  // 🟠 Hapus pembayaran
  delete: (id, callback) => {
    db.query('DELETE FROM payments WHERE id = ?', [id], callback);
  },
};

module.exports = Payment;
