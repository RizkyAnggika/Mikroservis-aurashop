const pool = require('../db');

// List products with optional query
exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1');
    res.json(rows);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { sku, name, category_id, purchase_price, selling_price, stock, low_stock_threshold } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (sku,name,category_id,purchase_price,selling_price,stock,low_stock_threshold) VALUES (?,?,?,?,?,?,?)',
      [sku, name, category_id || null, purchase_price || 0, selling_price || 0, stock || 0, low_stock_threshold || 5]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const fields = [];
    const values = [];
    for (const k of ['sku','name','category_id','purchase_price','selling_price','is_active','low_stock_threshold']) {
      if (k in body) { fields.push(`${k} = ?`); values.push(body[k]); }
    }
    if (!fields.length) return res.status(400).json({ message: 'No fields to update' });
    values.push(id);
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// adjust stock (positive or negative)
exports.adjustStock = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { change, type = 'adjustment', reference = null, note = null } = req.body;
    if (typeof change !== 'number') return res.status(400).json({ message: 'change must be a number' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [prodRows] = await conn.query('SELECT stock FROM products WHERE id = ? FOR UPDATE', [id]);
      if (!prodRows[0]) throw new Error('Product not found');
      const newStock = prodRows[0].stock + change;
      if (newStock < 0) throw new Error('Insufficient stock (would be negative)');

      await conn.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, id]);
      await conn.query('INSERT INTO stock_movements (product_id, change, type, reference, note) VALUES (?,?,?,?,?)', [id, change, type, reference, note]);
      await conn.commit();
      res.json({ ok: true, product_id: id, newStock });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) { next(err); }
};
