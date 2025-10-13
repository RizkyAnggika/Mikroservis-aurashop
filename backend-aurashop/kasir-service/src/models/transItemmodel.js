import db from "../config/db.js";

export const getItemsByTransactionId = (transactionId, callback) => {
  const sql = `
    SELECT ti.id, p.name, ti.quantity, ti.price
    FROM transaction_items ti
    JOIN products p ON ti.product_id = p.id
    WHERE ti.transaction_id = ?
  `;
  db.query(sql, [transactionId], callback);
};

export const addTransactionItem = (item, callback) => {
  const { transaction_id, product_id, quantity, price } = item;
  const sql = `
    INSERT INTO transaction_items (transaction_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [transaction_id, product_id, quantity, price], callback);
};

export const deleteItemsByTransactionId = (transactionId, callback) => {
  db.query(
    "DELETE FROM transaction_items WHERE transaction_id = ?",
    [transactionId],
    callback
  );
};
