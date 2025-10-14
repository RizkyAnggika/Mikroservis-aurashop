const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.post('/', requireAuth, transactionController.createTransaction);
router.get('/:id', requireAuth, transactionController.getTransaction);
router.get('/', requireAuth, transactionController.listTransactions);

module.exports = router;
