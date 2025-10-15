const db = require("../config/db");

const Transaction = {
  getAll: (callback) => {
    const sql = "SELECT * FROM transaksi ORDER BY tanggal DESC";
    db.query(sql, callback);
  },

  add: (totalHarga, items, callback) => {
    const sql = "INSERT INTO transaksi (tanggal, total_harga, detail) VALUES (NOW(), ?, ?)";
    db.query(sql, [totalHarga, JSON.stringify(items)], callback);
  }
};

module.exports = Transaction;
