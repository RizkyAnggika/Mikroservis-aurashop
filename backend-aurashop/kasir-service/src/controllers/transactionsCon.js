const Transaction = require("../models/transactionsmodel");
const Product = require("../models/productmodel");

// GET semua transaksi
exports.getAllTransactions = (req, res) => {
  Transaction.getAll((err, results) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Gagal mengambil data transaksi" });
    }
    res.json(results);
  });
};

// POST tambah transaksi
exports.addTransaction = (req, res) => {
  const { items } = req.body; // items = [{ id_produk, jumlah, harga }]
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Item transaksi tidak boleh kosong" });
  }

  const totalHarga = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

  Transaction.add(totalHarga, items, (err, result) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Gagal menyimpan transaksi" });
    }

    // Kurangi stok tiap produk
    items.forEach((item) => {
      Product.updateStock(item.id_produk, item.jumlah, (err2) => {
        if (err2) console.error("Gagal update stok:", err2);
      });
    });

    res.json({
      message: "Transaksi berhasil disimpan",
      id_transaksi: result.insertId,
      total_harga: totalHarga
    });
  });
};
