const Order = require('../models/orderModel');
const inventoryService = require('../services/inventoryService'); // 🔗 Integrasi ke inventory-service

// 🟢 Buat pesanan baru
exports.createOrder = async (req, res, next) => {
  try {
    const { userId, customer_name, items, totalPrice, note, order_status } = req.body;

    // 🔍 Validasi input dasar
    if (!userId || !customer_name || !items || !Array.isArray(items) || items.length === 0) {
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

    // Gunakan totalPrice dari perhitungan jika tidak dikirim manual
    const finalTotalPrice = totalPrice || calculatedTotalPrice;

    // 💾 Simpan ke database
    await new Promise((resolve, reject) => {
      Order.create(
        {
          userId,
          customer_name,
          items: detailedItems,
          totalPrice: finalTotalPrice,
          note: note || null,
          order_status: order_status || 'pending',
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    res.status(201).json({
      message: '✅ Pesanan berhasil dibuat',
      data: {
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

// 🔵 Ambil semua pesanan
exports.getOrders = (req, res, next) => {
  Order.findAll((err, results) => {
    if (err) return next(err);
    res.status(200).json({
      message: '📦 Daftar pesanan berhasil diambil',
      data: results,
    });
  });
};

// 🟣 Ambil satu pesanan berdasarkan ID
exports.getOrderById = (req, res, next) => {
  const id = req.params.id;
  Order.findById(id, (err, results) => {
    if (err) return next(err);
    if (results.length === 0)
      return res.status(404).json({ message: '❌ Pesanan tidak ditemukan' });

    res.status(200).json({
      message: '📄 Detail pesanan berhasil diambil',
      data: results[0],
    });
  });
};

// 🟠 Ubah status pesanan
exports.updateOrderStatus = (req, res, next) => {
  const id = req.params.id;
  const { order_status } = req.body;

  if (!order_status)
    return res.status(400).json({ message: 'Status baru harus diisi' });

  Order.updateStatus(id, order_status, (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: '❌ Pesanan tidak ditemukan' });

    res.status(200).json({
      message: `🟢 Status pesanan dengan ID ${id} berhasil diubah menjadi "${order_status}"`,
    });
  });
};

// 🔴 Hapus pesanan
exports.deleteOrder = (req, res, next) => {
  const id = req.params.id;

  Order.delete(id, (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: '❌ Pesanan tidak ditemukan' });

    res.status(200).json({ message: '🗑️ Pesanan berhasil dihapus' });
  });
};
