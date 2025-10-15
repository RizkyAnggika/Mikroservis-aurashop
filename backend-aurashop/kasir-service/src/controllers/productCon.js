const Product = require("../models/productmodel");

exports.getAllProducts = (req, res) => {
  Product.getAll((err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil produk" });
    res.json(results);
  });
};
