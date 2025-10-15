const db = require("../config/db");

const Product = {
  getAll: (callback) => {
    const sql = "SELECT * FROM produk";
    db.query(sql, callback);
  },
  updateStock: (id, jumlah, callback) => {
    const sql = "UPDATE produk SET stok = stok - ? WHERE id_produk = ?";
    db.query(sql, [jumlah, id], callback);
  }
};

module.exports = Product;
