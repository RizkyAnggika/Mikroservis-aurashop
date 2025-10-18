const axios = require('axios');


exports.getAllProducts = async (req, res) => {
  try {
    const response = await axios.get('http://localhost:4001/api/inventory');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products from inventory:', error.message);
    res.status(500).json({ message: 'Gagal mengambil produk dari layanan inventory' });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`http://localhost:4001/api/inventory/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ message: 'Gagal mengambil produk dari inventory' });
  }
};
