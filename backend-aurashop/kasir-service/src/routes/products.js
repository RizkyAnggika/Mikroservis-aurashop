const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

router.get('/', requireAuth, productController.list);
router.get('/:id', requireAuth, productController.get);
router.post('/', requireAuth, productController.create);
router.put('/:id', requireAuth, productController.update);
router.patch('/:id/stock', requireAuth, productController.adjustStock);

module.exports = router;
