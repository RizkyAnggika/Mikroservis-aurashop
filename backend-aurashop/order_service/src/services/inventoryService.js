// src/services/inventoryService.js
const axios = require('axios');

// URL dasar ke inventory-service
// Kalau nanti pakai Docker, ganti ke: http://inventory-service:4001
const INVENTORY_BASE_URL = process.env.INVENTORY_URL || 'http://localhost:4001/api/inventory';

/**
 * Ambil detail produk berdasarkan ID dari inventory-service
 * @param {number|string} productId
 * @returns {Promise<object|null>} Data produk (nama, harga, stok, dll)
 */
async function getProductById(productId) {
  try {
    const response = await axios.get(`${INVENTORY_BASE_URL}/${productId}`);
    
    // Karena inventory-service langsung mengembalikan data produk (tanpa "data" wrapper)
    // maka response.data sudah berisi objek produk
    return response.data;
  } catch (error) {
    console.error(`❌ Gagal ambil produk ${productId}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Ambil semua produk (opsional)
 */
async function getAllProducts() {
  try {
    const response = await axios.get(`${INVENTORY_BASE_URL}`);
    return response.data; // karena endpoint inventory-service mengirim array produk langsung
  } catch (error) {
    console.error('❌ Gagal ambil daftar produk:', error.response?.data || error.message);
    return [];
  }
}

module.exports = {
  getProductById,
  getAllProducts,
};
