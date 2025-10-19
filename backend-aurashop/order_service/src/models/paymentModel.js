// 📁 models/paymentModel.js
const db = require('../config/db'); // pool.promise()

const Payment = {
  // 🧩 Simpan data pembayaran
  create: async (paymentData) => {
    const query = `
      INSERT INTO payments (orderId, paymentMethod, amount, status)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      paymentData.orderId,
      paymentData.paymentMethod,
      paymentData.amount,
      paymentData.status || 'success',
    ]);
    return result;
  },

  // 🔍 Cari pembayaran berdasarkan orderId
  findByOrderId: async (orderId) => {
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE orderId = ?',
      [orderId]
    );
    return rows[0]; // ambil satu data (jika hanya 1 payment per order)
  },
};

module.exports = Payment;
