const Order = require('../models/orderModel');
const inventoryService = require('../services/inventoryService');
const HttpError = require('../utils/HttpError');

// 🟢 Buat pesanan baru
exports.createOrder = async (req, res, next) => {
  try {
    const { userId, customer_name, items, totalPrice, note, order_status } = req.body;

    if (!userId || !customer_name || !Array.isArray(items) || items.length === 0) {
      throw new HttpError('Data pesanan tidak lengkap atau format items salah', 400);
    }

    let calculatedTotalPrice = 0;
    const detailedItems = [];

    // 🔁 Validasi & hitung total
    for (const item of items) {
      if (!item.productId || !item.qty) {
        throw new HttpError('Setiap item harus punya productId dan qty', 400);
      }

      const product = await inventoryService.getProductById(item.productId);
      if (!product || !product.id) {
        throw new HttpError(`Produk dengan ID ${item.productId} tidak ditemukan`, 404);
      }

      const harga = Number(product.harga) || 0;
      const qty = Number(item.qty);
      const subtotal = harga * qty;

      calculatedTotalPrice += subtotal;

      detailedItems.push({
        productId: product.id,
        nama_produk: product.nama_produk,
        harga,
        quantity: qty,
        subtotal,
      });
    }

    const finalTotalPrice = totalPrice || calculatedTotalPrice;

    // 💾 Simpan ke DB
    const result = await Order.create({
      userId,
      customer_name,
      items: detailedItems,
      totalPrice: finalTotalPrice,
      note: note || null,
      order_status: order_status || 'pending',
    });

    res.status(201).json({
      message: '✅ Pesanan berhasil dibuat',
      data: {
        orderId: result.insertId,
        userId,
        customer_name,
        items: detailedItems,
        totalPrice: finalTotalPrice,
        note: note || null,
        order_status: order_status || 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🔵 Ambil semua pesanan
exports.getOrders = async (req, res, next) => {
  try {
    const results = await Order.findAll();
    const formatted = results.map(o => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
    }));

    res.status(200).json({
      message: '📦 Daftar pesanan berhasil diambil',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// 🟣 Ambil pesanan berdasarkan ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) throw new HttpError('Pesanan tidak ditemukan', 404);

    order.items = JSON.parse(order.items || '[]');

    res.status(200).json({
      message: '📄 Detail pesanan berhasil diambil',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// 🟢 Ambil pesanan berdasarkan userId (riwayat)
exports.getOrdersByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new HttpError('User ID wajib diisi', 400);

    const results = await Order.findByUserId(userId);
    if (results.length === 0) throw new HttpError('Belum ada riwayat pesanan', 404);

    const formatted = results.map(o => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
    }));

    res.status(200).json({
      message: '📜 Riwayat pesanan berhasil diambil',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// 🟠 Ubah status pesanan
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!order_status) throw new HttpError('Status baru harus diisi', 400);

    const result = await Order.updateStatus(id, order_status);
    if (result.affectedRows === 0) throw new HttpError('Pesanan tidak ditemukan', 404);

    res.status(200).json({
      message: `🟢 Status pesanan dengan ID ${id} diubah menjadi "${order_status}"`,
    });
  } catch (error) {
    next(error);
  }
};

// 🔴 Hapus pesanan
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Order.delete(id);

    if (result.affectedRows === 0) throw new HttpError('Pesanan tidak ditemukan', 404);

    res.status(200).json({ message: '🗑️ Pesanan berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
