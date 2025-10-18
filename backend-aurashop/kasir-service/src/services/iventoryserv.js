const axios = require('axios');

const INVENTORY_BASE_URL = 'http://localhost:4001/api/inventory';

exports.fetchAllProducts = async () => {
  const response = await axios.get(INVENTORY_BASE_URL);
  return response.data;
};

exports.fetchProductById = async (id) => {
  const response = await axios.get(`${INVENTORY_BASE_URL}/${id}`);
  return response.data;
};
