const Product = require('../models/productModel');

// ========= Upload gambar ke kolom LONGBLOB =========
// POST /api/inventory/:id/image  (form-data field name: "image")
exports.uploadProductImage = (req, res) => {
  const { id } = req.params;
  const file = req.file; // dari multer memoryStorage

  if (!file) {
    return res
      .status(400)
      .json({ message: "File tidak ditemukan. Gunakan field name: 'image'." });
  }

  Product.setImage(id, file.buffer, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const url = `${req.protocol}://${req.get('host')}/api/inventory/${id}/image`;
    return res.json({ url });
  });
};

// ========= Stream gambar dari LONGBLOB =========
// GET /api/inventory/:id/image
exports.getProductImage = (req, res) => {
  const { id } = req.params;

  Product.getImage(id, (err, buffer) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!buffer) return res.status(404).json({ message: 'Gambar tidak ada' });

    // (opsional) simpan mimetype saat upload; sementara pakai jpeg
    res.set('Content-Type', 'image/jpeg');
    return res.send(buffer);
  });
};

// ========== CRUD ==========

exports.getAllProducts = (req, res) => {
  Product.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const base = `${req.protocol}://${req.get('host')}/api/inventory`;
    const mapped = rows.map((r) => ({
      ...r,
      // kirim URL gambar, bukan BLOB
      gambar: `${base}/${r.id}/image`,
    }));

    return res.json(mapped);
  });
};

exports.getProductById = (req, res) => {
  Product.getById(req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows.length) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const r = rows[0];
    const base = `${req.protocol}://${req.get('host')}/api/inventory`;
    return res.json({ ...r, gambar: `${base}/${r.id}/image` });
  });
};

exports.createProduct = (req, res) => {
  const newProduct = {
    nama_produk: req.body.nama_produk,
    kategori: req.body.kategori,
    harga: req.body.harga,
    stok: req.body.stok,
    deskripsi: req.body.deskripsi,
    // gambar diupload di endpoint terpisah
    gambar: null,
  };

  Product.create(newProduct, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.json({ message: 'Produk berhasil ditambahkan!', id: result.insertId });
  });
};

exports.updateProduct = (req, res) => {
  const data = {
    nama_produk: req.body.nama_produk,
    kategori: req.body.kategori,
    harga: req.body.harga,
    stok: req.body.stok,
    deskripsi: req.body.deskripsi,
    // jangan set 'gambar' di sini (pakai endpoint upload)
  };

  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

  Product.update(req.params.id, data, (err) => {
    if (err) return res.status(500).json({ error: err });
    return res.json({ message: 'Produk berhasil diperbarui!' });
  });
};

exports.deleteProduct = (req, res) => {
  Product.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err });
    return res.json({ message: 'Produk berhasil dihapus!' });
  });
};

// ========= Integrasi order-service =========
exports.reduceStock = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  Product.reduceStock(id, quantity, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ message: 'Stok tidak cukup atau produk tidak ditemukan.' });
    }
    return res.json({ message: 'Stok berhasil dikurangi!' });
  });
};
