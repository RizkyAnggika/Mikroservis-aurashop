// routes/productRoutes.js
const express = require('express');
const router = express.Router();

const controller = require('../controllers/productController');
const upload = require('../middlewares/upload'); // <- ini fungsi multer

// CRUD
router.get('/', controller.getAllProducts);
router.get('/:id', controller.getProductById);
router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);
router.patch('/:id/reduce-stok', controller.reduceStock);

// IMAGE (BLOB)
router.post('/:id/image', upload.single('image'), controller.uploadProductImage);
router.get('/:id/image', controller.getProductImage);

module.exports = router;
