const axios = require('axios');

// URL service Inventory milik kamu
const INVENTORY_BASE_URL = 'http://localhost:4001/api/inventory';

const inventoryService = {
  reduceStock: async (productId, quantity) => {
    try {
      const response = await axios.patch(`${INVENTORY_BASE_URL}/${productId}/reduce-stok`, { quantity });
      return response.data;
    } catch (error) {
      console.error('❌ Gagal update stok di Inventory Service:', error.message);
      throw new Error('Gagal memperbarui stok produk');
    }
  },
};

module.exports = inventoryService;
