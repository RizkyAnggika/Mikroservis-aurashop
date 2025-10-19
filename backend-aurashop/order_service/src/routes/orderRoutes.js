const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
  getInvoiceByOrderId, // 🧾 tambahkan import baru
} = require('../controllers/orderController');

const router = express.Router();

// ================================
// 📦 ROUTES PESANAN
// ================================

// 🟢 Buat pesanan baru
router.post('/', createOrder);

// 🔵 Ambil semua pesanan (Admin)
router.get('/', getOrders);

// 🟢 Ambil semua pesanan berdasarkan user (riwayat pesanan)
router.get('/user/:userId', getOrdersByUser);

// 🧾 Ambil invoice pesanan (order + payment)
router.get('/:id/invoice', getInvoiceByOrderId); // ← ✅ tambahkan ini

// 🟣 Ambil satu pesanan berdasarkan ID
router.get('/:id', getOrderById);

// 🟠 Ubah status pesanan
router.put('/:id/status', updateOrderStatus);

// 🔴 Hapus pesanan
router.delete('/:id', deleteOrder);

module.exports = router;
