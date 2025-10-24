// services/inventoryService.js
const axios = require('axios');
const HttpError = require('../utils/HttpError');

// ✅ BENAR: sesuai server inventory (server.js) -> app.use('/api/inventory', productRoutes);
const INVENTORY_URL = 'http://localhost:4001/api/inventory';

exports.reduceStock = async (productId, quantity) => {
  try {
    const q = Math.max(0, parseInt(quantity, 10) || 0);
    const url = `${INVENTORY_URL}/${productId}/reduce-stok`; // ✅ BENAR: reduce-stok (bukan reduce-stock)
    const res = await axios.patch(url, { quantity: q });

    console.log('✅ reduceStock OK', { url, q, status: res.status, data: res.data });
    return res.data;
  } catch (error) {
    console.error('❌ reduceStock ERR', {
      url: `${INVENTORY_URL}/${productId}/reduce-stok`,
      quantity,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new HttpError('Gagal mengurangi stok produk', 500);
  }
};
