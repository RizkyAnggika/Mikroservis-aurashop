// src/services/inventoryService.js
const axios = require('axios');

// URL dasar ke inventory-service (ubah sesuai docker-compose atau lokal)
const INVENTORY_BASE_URL = process.env.INVENTORY_URL || 'http://localhost:5002/api/products';

async function getProductById(productId) {
  try {
    const response = await axios.get(`${INVENTORY_BASE_URL}/${productId}`);
    return response.data; // hasil dari inventory-service
  } catch (error) {
    console.error('❌ Gagal mengambil data produk dari inventory-service:', error.message);
    throw new Error('Tidak dapat mengambil data produk');
  }
}

module.exports = {
  getProductById,
};
