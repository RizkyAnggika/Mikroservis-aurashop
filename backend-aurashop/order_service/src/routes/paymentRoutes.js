const express = require('express');
const router = express.Router();
const { createPayment, getPaymentsByOrder } = require('../controllers/paymentController');
const validateId = require('../middlewares/validateId'); // optional middleware untuk validasi

/**
 * @route POST /api/orders/:id/pay
 * @desc  Simulasi pembayaran pesanan
 */
router.post('/:id/pay', validateId, createPayment);

/**
 * @route GET /api/orders/:id/payments
 * @desc  Mendapatkan riwayat pembayaran untuk pesanan tertentu
 */
router.get('/:id/payments', validateId, getPaymentsByOrder);

module.exports = router;
