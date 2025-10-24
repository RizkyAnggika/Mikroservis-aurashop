// 📁 models/orderModel.js
const db = require('../config/db');

const Order = {
  // 🟢 Buat pesanan baru
  create: async (data) => {
    const notes = (data.notes ?? data.note) || null;
    const query = `
      INSERT INTO orders (userId, customer_name, items, totalPrice, notes, order_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.query(query, [
      data.userId,
      data.customer_name,
      JSON.stringify(data.items || []),
      data.totalPrice,
      notes,
      data.order_status || 'pending',
    ]);
    return result;
  },

  // 🔵 Ambil semua pesanan
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows;
  },

  // 🟣 Ambil satu pesanan
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0];
  },

  // 🟢 Ambil pesanan per user
  findByUserId: async (userId) => {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE userId = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  // 🟣 Ambil pesanan per status
  findByStatus: async (status) => {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE order_status = ? ORDER BY created_at DESC',
      [status]
    );
    return rows;
  },

  // 🟠 Update status
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [status, id]
    );
    return result;
  },

  // 🔴 Hapus
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
    return result;
  },

  // 🧾 Join dengan payments (opsional)
  findWithPaymentById: async (orderId) => {
    const query = `
      SELECT o.*, p.id AS payment_id, p.paymentMethod, p.amount AS payment_amount, p.status AS payment_status
      FROM orders o
      LEFT JOIN payments p ON o.id = p.orderId
      WHERE o.id = ?
    `;
    const [rows] = await db.query(query, [orderId]);
    return rows[0];
  },

  // 🟠 UPDATE field pesanan (nama, items, total, notes)
  update: async (id, data) => {
    const sets = [];
    const vals = [];

    if (data.customer_name !== undefined) {
      sets.push('customer_name = ?');
      vals.push(data.customer_name);
    }
    if (data.items !== undefined) {
      sets.push('items = ?');
      vals.push(JSON.stringify(data.items || []));
    }
    if (data.totalPrice !== undefined) {
      sets.push('totalPrice = ?');
      vals.push(Number(data.totalPrice) || 0);
    }
    if (data.notes !== undefined) {
      sets.push('notes = ?');
      vals.push(data.notes ?? null);
    }

    if (sets.length === 0) {
      return { affectedRows: 0 };
    }

    const sql = `UPDATE orders SET ${sets.join(', ')} WHERE id = ?`;
    vals.push(id);

    const [result] = await db.query(sql, vals);
    return result;
  },
};

module.exports = Order;
