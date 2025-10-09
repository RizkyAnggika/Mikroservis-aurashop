const express = require('express');
const { createOrder, getOrders } = require('../controllers/orderController');

const router = express.Router();

// endpoint untuk membuat pesanan
router.post('/', createOrder);

// endpoint untuk melihat semua pesanan
router.get('/', getOrders);

module.exports = router;
