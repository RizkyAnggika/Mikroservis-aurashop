const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// helper to generate invoice numbers (simple)
function generateInvoice() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  const rand = Math.floor(Math.random()*9000)+1000;
  return `INV${y}${m}${d}${rand}`;
}

/**
 * Create transaction:
 * payload:
 * {
 *   customer_name: "Budi",
 *   items: [{ product_id: 1, qty: 2 }, ...],
 *   payment_method: "cash",
 *   payment_received: 50000
 * }
 */
exports.createTransaction = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const userId = req.user.id;
    const { customer_name = null, items = [], payment_method = 'cash', payment_received = 0 } = req.body;
    if (!Array.isArray(items) || items.length === 0) throw { status: 400, message: 'items required' };

    // fetch product data for each item and lock rows
    const productIds = items.map(i => i.product_id);
    const placeholders = productIds.map(()=>'?').join(',');
    const [products] = await conn.query(`SELECT * FROM products WHERE id IN (${placeholders}) FOR UPDATE`, productIds);

    // map products by id
    const prodMap = {};
    for (const p of products) prodMap[p.id] = p;

    // validate stock & calculate totals
    let total = 0;
    let totalCost = 0;
    const lineItems = [];
    for (const it of items) {
      const p = prodMap[it.product_id];
      if (!p) throw { status: 400, message: `Product ${it.product_id} not found` };
      const qty = Number(it.qty);
      if (!Number.isInteger(qty) || qty <= 0) throw { status: 400, message: 'qty must be positive integer' };
      if (p.stock < qty) throw { status: 400, message: `Insufficient stock for product ${p.name}` };

      const unit_price = Number(p.selling_price);
      const unit_cost = Number(p.purchase_price);
      const subtotal = +((unit_price * qty).toFixed(2));
      total += subtotal;
      totalCost += unit_cost * qty;

      lineItems.push({
        product_id: p.id,
        sku: p.sku,
        name: p.name,
        qty,
        unit_price,
        unit_cost,
        subtotal
      });
    }

    const invoice_no = generateInvoice();
    // insert transaction
    const [tResult] = await conn.query(
      `INSERT INTO transactions (invoice_no, user_id, customer_name, total_amount, total_cost, payment_method, payment_received, change_amount) VALUES (?,?,?,?,?,?,?,?)`,
      [invoice_no, userId, customer_name, total.toFixed(2), totalCost.toFixed(2), payment_method, Number(payment_received).toFixed(2), Math.max(0, Number(payment_received) - total).toFixed(2)]
    );
    const transactionId = tResult.insertId;

    // insert items and decrement stock + add stock_movements
    for (const li of lineItems) {
      await conn.query(
        `INSERT INTO transaction_items (transaction_id, product_id, sku, name, qty, unit_price, unit_cost, subtotal) VALUES (?,?,?,?,?,?,?,?)`,
        [transactionId, li.product_id, li.sku, li.name, li.qty, li.unit_price, li.unit_cost, li.subtotal]
      );

      // decrement stock
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [li.qty, li.product_id]);

      // stock movement record (negative)
      await conn.query('INSERT INTO stock_movements (product_id, change, type, reference, note) VALUES (?,?,?,?,?)',
        [li.product_id, -li.qty, 'sale', invoice_no, `Sale item ${li.name}`]
      );
    }

    await conn.commit();

    // return created transaction basic info
    res.status(201).json({
      id: transactionId,
      invoice_no,
      total_amount: total,
      payment_received: Number(payment_received),
      change_amount: Math.max(0, Number(payment_received) - total)
    });
  } catch (err) {
    try { await conn.rollback(); } catch(_) {}
    next(err);
  } finally {
    conn.release();
  }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [trows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!trows[0]) return res.status(404).json({ message: 'Not found' });
    const tx = trows[0];
    const [items] = await pool.query('SELECT * FROM transaction_items WHERE transaction_id = ?', [id]);
    res.json({ transaction: tx, items });
  } catch (err) { next(err); }
};

exports.listTransactions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT t.*, u.username, u.name as user_name FROM transactions t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT 100');
    res.json(rows);
  } catch (err) { next(err); }
};
