const inventoryService = require('../services/inventoryService');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await inventoryService.fetchAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Gagal konek ke inventory-service' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await inventoryService.fetchProductById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil produk berdasarkan ID' });
  }
};
