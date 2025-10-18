const express = require('express');
const { createPayment } = require('../controllers/paymentController');
const router = express.Router();

/**
 * @route POST /api/orders/:id/pay
 * @desc  Simulasi pembayaran pesanan
 */
router.post('/:id/pay', createPayment);


module.exports = router;
