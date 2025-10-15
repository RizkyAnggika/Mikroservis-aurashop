const Transaction = require("../models/transactionsmodel");
const Product = require("../models/productmodel");

exports.getAllTransactions = (req, res) => {
  Transaction.getAll((err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil transaksi" });
    res.json(results);
  });
};

exports.addTransaction = (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0)
    return res.status(400).json({ message: "Item transaksi kosong" });

  const totalHarga = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

  Transaction.add(totalHarga, items, (err, result) => {
    if (err) return res.status(500).json({ message: "Gagal menyimpan transaksi" });

    // update stok
    items.forEach((item) => {
      Product.updateStock(item.id_produk, item.jumlah, (err2) => {
        if (err2) console.log("Gagal update stok:", err2);
      });
    });

    res.json({ message: "Transaksi berhasil disimpan", id_transaksi: result.insertId });
  });
};
