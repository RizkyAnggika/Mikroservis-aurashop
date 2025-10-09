// src/routes/orderRoutes.js
const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Membuat pesanan baru
 */
router.post('/', createOrder);

/**
 * @route   GET /api/orders
 * @desc    Mengambil semua pesanan
 */
router.get('/', getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Mengambil satu pesanan berdasarkan ID
 */
router.get('/:id', getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Mengubah status pesanan (pending → completed)
 */
router.put('/:id/status', updateOrderStatus);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Menghapus pesanan
 */
router.delete('/:id', deleteOrder);

module.exports = router;
