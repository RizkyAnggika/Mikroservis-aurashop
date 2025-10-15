const express = require("express");
const cors = require("cors");
const app = express();

const productRoutes = require("./routes/products");
const transactionRoutes = require("./routes/transactions");

app.use(cors());
app.use(express.json());

// Routing utama
app.use("/api/produk", productRoutes);
app.use("/api/transaksi", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Kasir Service Toko Teh Berjalan 🚀");
});

module.exports = app;
