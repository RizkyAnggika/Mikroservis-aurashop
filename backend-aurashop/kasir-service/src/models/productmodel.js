import db from "../config/db.js";

export const getAllProducts = (callback) => {
  db.query("SELECT * FROM products", callback);
};

export const getProductById = (id, callback) => {
  db.query("SELECT * FROM products WHERE id = ?", [id], callback);
};

export const addProduct = (product, callback) => {
  const { name, category, price, stock } = product;
  db.query(
    "INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)",
    [name, category, price, stock],
    callback
  );
};

export const updateProduct = (id, product, callback) => {
  const { name, category, price, stock } = product;
  db.query(
    "UPDATE products SET name=?, category=?, price=?, stock=? WHERE id=?",
    [name, category, price, stock, id],
    callback
  );
};

export const deleteProduct = (id, callback) => {
  db.query("DELETE FROM products WHERE id = ?", [id], callback);
};
