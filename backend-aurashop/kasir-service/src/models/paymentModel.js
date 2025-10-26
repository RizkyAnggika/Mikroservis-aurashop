// 📁 models/paymentModel.js
const db = require('../../../order_service/src/config/db'); // pool.promise()

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
      'SELECT * FROM payments WHERE orderId = ? ORDER BY created_at DESC, id DESC',
      [orderId]
    );
    return rows;
  },


findAll: async (options = {}) => {
    const {
      offset = 0,
      limit = 50,
      status,
      paymentMethod,
      orderId,
      order = 'DESC', // ASC/DESC
    } = options;

    const where = [];
    const params = [];

    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    if (paymentMethod) {
      where.push('paymentMethod = ?');
      params.push(paymentMethod);
    }

    if (orderId) {
      where.push('orderId = ?');
      params.push(orderId);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Urutkan pakai created_at kalau ada, fallback ke id
    const orderBy = `ORDER BY created_at ${order}, id ${order}`;

    const sql = `
      SELECT * 
      FROM payments
      ${whereSql}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    // LIMIT dulu baru OFFSET (MySQL: LIMIT ?, ? juga boleh, ini style yang eksplisit)
    params.push(Number(limit));
    params.push(Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  },
};

module.exports = Payment;
