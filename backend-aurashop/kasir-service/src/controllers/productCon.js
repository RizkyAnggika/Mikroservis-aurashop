const Product = require("../models/productmodel");


exports.getAllProducts = (req, res) => {
  Product.getAll((err, results) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Gagal mengambil data produk" });
    }
    res.json(results);
  });
};
