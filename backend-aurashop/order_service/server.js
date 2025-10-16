require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const orderRoutes = require('./src/routes/orderRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const db = require('./src/config/db'); // langsung pakai koneksi mysql2

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/orders', orderRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
});
