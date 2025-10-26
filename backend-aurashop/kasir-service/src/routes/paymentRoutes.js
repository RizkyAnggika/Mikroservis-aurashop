const express = require('express');
const router = express.Router();
const { createPayment, getPaymentsByOrder, getAllPayments, deletePay} = require('../controllers/paymentController');
const validateId = require('../middleware/validateId'); // optional middleware untuk validasi

// 💳 Pay order
// POST /api/orders/:id/pay
router.post('/orders/:id/pay', validateId, createPayment);

// 🧾 Payments by order
// GET /api/orders/:id/payments
router.get('/orders/:id/payments', validateId, getPaymentsByOrder);

// 🗂️ All payments (filter & pagination)
// GET /api/payments
router.get('/payments', getAllPayments);

// 📁 routes/paymentRoutes.js

router.delete('/payments/:id', validateId, deletePay); // 🗑️ Delete payment by ID


module.exports = router;
