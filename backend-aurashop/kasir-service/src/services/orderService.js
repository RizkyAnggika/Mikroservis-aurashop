const axios = require('axios');

// kasir_service/src/services/orderService.js
const ORDER_BASE_URL = process.env.ORDER_URL || 'http://order:5001/api/orders';


exports.getOrderById = async (orderId) => {
  const response = await axios.get(`${ORDER_BASE_URL}/${orderId}`);
  return response.data.data;
};

exports.updateOrderStatus = async (orderId, status) => {
  await axios.put(`${ORDER_BASE_URL}/${orderId}/status`, { order_status: status });
};

exports.deleteOrder = async (orderId) => {
  try {
    const response = await axios.delete(`${ORDER_BASE_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Gagal menghapus order:', error.message);
    throw new Error('Gagal menghapus order dari order_service');
  }
};
