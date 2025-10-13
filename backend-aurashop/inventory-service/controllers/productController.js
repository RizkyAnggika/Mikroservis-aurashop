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

// Tambahan untuk integrasi dengan order-service

exports.reduceStock = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  // Panggil model untuk kurangi stok
  Product.reduceStock(id, quantity, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(400).json({ message: 'Stok tidak cukup atau produk tidak ditemukan.' });
    res.json({ message: 'Stok berhasil dikurangi!' });
  });
};

