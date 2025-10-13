import db from "../config/db.js";

// Dapatkan semua user
export const getAllUsers = (callback) => {
  db.query("SELECT id, name, email, role FROM users", callback);
};

// Dapatkan user berdasarkan email
export const getUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

// Tambahkan user baru (register kasir)
export const createUser = (user, callback) => {
  const { name, email, password, role } = user;
  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, password, role || "cashier"],
    callback
  );
};

// Update data user
export const updateUser = (id, data, callback) => {
  const { name, email, password } = data;
  db.query(
    "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
    [name, email, password, id],
    callback
  );
};

// Hapus user
export const deleteUser = (id, callback) => {
  db.query("DELETE FROM users WHERE id = ?", [id], callback);
};
