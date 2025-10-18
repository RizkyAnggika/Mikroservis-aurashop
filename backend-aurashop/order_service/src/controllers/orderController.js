const Order = require('../models/orderModel');
const inventoryService = require('../services/inventoryService');
const HttpError = require('../utils/HttpError'); // gunakan error class custom

// 🟢 Buat pesanan baru
exports.createOrder = async (req, res, next) => {
  try {
    const { userId, customer_name, items, totalPrice, note, order_status } = req.body;

    // 🔍 Validasi input dasar
    if (!userId || !customer_name || !Array.isArray(items) || items.length === 0) {
      throw new HttpError('Data pesanan tidak lengkap atau format items salah', 400);
    }

    let calculatedTotalPrice = 0;
    const detailedItems = [];

    // 🔁 Ambil data produk dari inventory-service
    for (const item of items) {
      if (!item.productId || !item.qty) {
        throw new HttpError('Setiap item harus punya productId dan qty', 400);
      }

      const product = await inventoryService.getProductById(item.productId);

      if (!product || !product.id) {
        throw new HttpError(`Produk dengan ID ${item.productId} tidak ditemukan`, 404);
      }

      const harga = Number(product.harga) || 0;
      const qty = Number(item.qty) || 1;
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

    // 💾 Simpan ke database
    const result = await new Promise((resolve, reject) => {
      Order.create(
        {
          userId,
          customer_name,
          items: detailedItems,
          totalPrice: finalTotalPrice,
          note: note || null,
          order_status: order_status || 'pending',
        },
        (err, res) => (err ? reject(err) : resolve(res))
      );
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

// 🔵 Ambil semua pesanan (admin)
exports.getOrders = async (req, res, next) => {
  try {
    const results = await new Promise((resolve, reject) => {
      Order.findAll((err, rows) => (err ? reject(err) : resolve(rows)));
    });

    const formatted = results.map(order => ({
      ...order,
      items: JSON.parse(order.items),
    }));

    res.status(200).json({
      message: '📦 Daftar pesanan berhasil diambil',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// 🟣 Ambil satu pesanan berdasarkan ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await new Promise((resolve, reject) => {
      Order.findById(id, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    if (result.length === 0) {
      throw new HttpError('Pesanan tidak ditemukan', 404);
    }

    const order = result[0];
    order.items = JSON.parse(order.items);

    res.status(200).json({
      message: '📄 Detail pesanan berhasil diambil',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// 🟢 Ambil semua pesanan milik user tertentu (riwayat)
exports.getOrdersByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new HttpError('User ID wajib diisi', 400);

    const results = await new Promise((resolve, reject) => {
      Order.findByUserId(userId, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    if (results.length === 0) {
      throw new HttpError('Belum ada riwayat pesanan untuk user ini', 404);
    }

    const formatted = results.map(order => ({
      ...order,
      items: JSON.parse(order.items),
    }));

    res.status(200).json({
      message: '📜 Riwayat pesanan pengguna berhasil diambil',
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

    const result = await new Promise((resolve, reject) => {
      Order.updateStatus(id, order_status, (err, res) => (err ? reject(err) : resolve(res)));
    });

    if (result.affectedRows === 0) {
      throw new HttpError('Pesanan tidak ditemukan', 404);
    }

    res.status(200).json({
      message: `🟢 Status pesanan dengan ID ${id} berhasil diubah menjadi "${order_status}"`,
    });
  } catch (error) {
    next(error);
  }
};

// 🔴 Hapus pesanan
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await new Promise((resolve, reject) => {
      Order.delete(id, (err, res) => (err ? reject(err) : resolve(res)));
    });

    if (result.affectedRows === 0) {
      throw new HttpError('Pesanan tidak ditemukan', 404);
    }

    res.status(200).json({ message: '🗑️ Pesanan berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
