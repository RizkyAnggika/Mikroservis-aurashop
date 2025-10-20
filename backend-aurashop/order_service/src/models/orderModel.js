const db = require('../config/db');

const Order = {
  // 🟢 Buat pesanan baru
  create: async (data) => {
    const query = `
      INSERT INTO orders (userId, customer_name, items, totalPrice, note, order_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.query(query, [
      data.userId,
      data.customer_name,
      JSON.stringify(data.items),
      data.totalPrice,
      data.note,
      data.order_status || 'pending',
    ]);
    return result; // bisa ambil result.insertId
  },

  // 🔵 Ambil semua pesanan
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows;
  },

  // 🟣 Ambil pesanan berdasarkan ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0]; // ambil satu
  },

  // 🟢 Ambil semua pesanan berdasarkan userId (riwayat per user)
  findByUserId: async (userId) => {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE userId = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  // 🟣 Ambil semua pesanan berdasarkan status
  findByStatus: async (status) => {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE order_status = ? ORDER BY created_at DESC',
      [status]
    );
    return rows;
  },

  // 🟠 Update status pesanan
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [status, id]
    );
    return result;
  },

  // 🔴 Hapus pesanan
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
    return result;
  },

  // 🧾 Ambil pesanan + pembayaran (untuk invoice)
  findWithPaymentById: async (orderId) => {
    const query = `
      SELECT 
        o.*, 
        p.id AS payment_id,
        p.paymentMethod,
        p.amount AS payment_amount,
        p.status AS payment_status
      FROM orders o
      LEFT JOIN payments p ON o.id = p.orderId
      WHERE o.id = ?
    `;
    const [rows] = await db.query(query, [orderId]);
    return rows[0];
  },
};

module.exports = Order;
