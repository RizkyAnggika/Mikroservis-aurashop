// 📁 models/paymentModel.js
const db = require('../config/db');

const Payment = {
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

  findByOrderId: (orderId, callback) => {
    db.query('SELECT * FROM payments WHERE orderId = ?', [orderId], callback);
  },
};

module.exports = Payment;
