const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes');
require('./config/db');
const path = require('path');   

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/inventory', productRoutes);

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🚀 Inventory service running on http://localhost:${PORT}`);
});
