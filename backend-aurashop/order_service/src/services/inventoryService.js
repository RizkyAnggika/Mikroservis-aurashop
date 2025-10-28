// 📁 src/services/inventoryService.js
const axios = require('axios');

const INVENTORY_BASE_URL = process.env.INVENTORY_URL || 'http://inventory:4001/api/inventory';


const inventoryService = {
  /**
   * Ambil data produk berdasarkan ID
   * (nama, harga, stok, dll)
   */
  getProductById: async (productId) => {
    try {
      const response = await axios.get(`${INVENTORY_BASE_URL}/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Gagal ambil produk ${productId}:`, error.response?.data || error.message);
      throw new Error('Gagal mengambil data produk dari Inventory Service');
    }
  },

  /**
   * Kurangi stok produk setelah order dibuat
   */
  reduceStock: async (productId, quantity) => {
    try {
      const response = await axios.patch(`${INVENTORY_BASE_URL}/${productId}/reduce-stok`, { quantity });
      return response.data;
    } catch (error) {
      console.error('❌ Gagal update stok di Inventory Service:', error.response?.data || error.message);
      throw new Error('Gagal memperbarui stok produk');
    }
  },
};

module.exports = inventoryService;
