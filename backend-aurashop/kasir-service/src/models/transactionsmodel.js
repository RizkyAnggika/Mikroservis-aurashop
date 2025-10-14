import db from "../config/db.js";

export const getAllTransactions = (callback) => {
  const sql = `
    SELECT t.id, t.user_id, u.name AS cashier, t.total_price, t.payment_method, t.date 
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.date DESC
  `;
  db.query(sql, callback);
};

export const getTransactionById = (id, callback) => {
  const sql = `
    SELECT t.*, u.name AS cashier
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    WHERE t.id = ?
  `;
  db.query(sql, [id], callback);
};

export const addTransaction = (transaction, callback) => {
  const { user_id, total_price, payment_method } = transaction;
  const sql = `
    INSERT INTO transactions (user_id, total_price, payment_method, date)
    VALUES (?, ?, ?, NOW())
  `;
  db.query(sql, [user_id, total_price, payment_method], callback);
};

export const deleteTransaction = (id, callback) => {
  db.query("DELETE FROM transactions WHERE id = ?", [id], callback);
};
