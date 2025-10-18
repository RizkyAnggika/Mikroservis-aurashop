const Order = require('../models/orderModel');
const inventoryService = require('../services/inventoryService'); // 🔗 Integrasi ke inventory-service

// 🟢 Buat pesanan baru
exports.createOrder = async (req, res, next) => {
  try {
    const { userId, customer_name, items, totalPrice, note, order_status } = req.body;

    // 🔍 Validasi input dasar
    if (!userId || !customer_name || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Data pesanan tidak lengkap atau format items salah' });
    }

    let calculatedTotalPrice = 0;
    const detailedItems = [];

    // 🔁 Ambil data produk dari inventory-service
    for (const item of items) {
      if (!item.productId || !item.qty) {
        return res.status(400).json({ message: 'Setiap item harus punya productId dan qty' });
      }

      // 🔗 Ambil data produk dari inventory service
      const product = await inventoryService.getProductById(item.productId);

      if (!product || !product.id) {
        return res.status(404).json({ message: `Produk dengan ID ${item.productId} tidak ditemukan` });
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

    // 💰 Gunakan totalPrice hasil hitungan (kalau tidak dikirim dari client)
    const finalTotalPrice = totalPrice || calculatedTotalPrice;

    // 💾 Simpan pesanan ke database
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
    console.error('❌ createOrder error:', error);
    next(error);
  }
};

// 🔵 Ambil semua pesanan (admin)
exports.getOrders = async (req, res, next) => {
  try {
    const results = await new Promise((resolve, reject) => {
      Order.findAll((err, rows) => (err ? reject(err) : resolve(rows)));
    });

    // 🧩 Parse kolom items (JSON)
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
    const id = req.params.id;
    const result = await new Promise((resolve, reject) => {
      Order.findById(id, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    if (result.length === 0) {
      return res.status(404).json({ message: '❌ Pesanan tidak ditemukan' });
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

// 🟢 Ambil semua pesanan milik user tertentu (riwayat pesanan)
exports.getOrdersByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID wajib diisi' });
    }

    const results = await new Promise((resolve, reject) => {
      Order.findByUserId(userId, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    if (results.length === 0) {
      return res.status(404).json({ message: '❌ Belum ada riwayat pesanan untuk user ini' });
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
    const id = req.params.id;
    const { order_status } = req.body;

    if (!order_status) {
      return res.status(400).json({ message: 'Status baru harus diisi' });
    }

    const result = await new Promise((resolve, reject) => {
      Order.updateStatus(id, order_status, (err, res) => (err ? reject(err) : resolve(res)));
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '❌ Pesanan tidak ditemukan' });
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
    const id = req.params.id;

    const result = await new Promise((resolve, reject) => {
      Order.delete(id, (err, res) => (err ? reject(err) : resolve(res)));
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '❌ Pesanan tidak ditemukan' });
    }

    res.status(200).json({ message: '🗑️ Pesanan berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
