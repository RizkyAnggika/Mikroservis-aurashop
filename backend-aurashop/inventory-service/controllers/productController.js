const Product = require('../models/productModel');

exports.getAllProducts = (req, res) => {
  Product.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getProductById = (req, res) => {
  Product.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
};

exports.createProduct = (req, res) => {
  const newProduct = {
    nama_produk: req.body.nama_produk,
    kategori: req.body.kategori,
    harga: req.body.harga,
    stok: req.body.stok,
    deskripsi: req.body.deskripsi,
    gambar: req.body.gambar
  };

  Product.create(newProduct, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Produk berhasil ditambahkan!', id: result.insertId });
  });
};

exports.updateProduct = (req, res) => {
  Product.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Produk berhasil diperbarui!' });
  });
};

exports.deleteProduct = (req, res) => {
  Product.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Produk berhasil dihapus!' });
  });
};

