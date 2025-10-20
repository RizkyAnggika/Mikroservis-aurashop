const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/products');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// route utama kasir
app.use('/api/products', productRoutes);

module.exports = app;
