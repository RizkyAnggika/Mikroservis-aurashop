// 📁 controllers/orderController.js
const Order = require('../models/orderModel');
// const Payment = require('../models/paymentModel'); // untuk invoice
const inventoryService = require('../services/inventoryService');
const HttpError = require('../utils/HttpError');
const axios = require('axios'); // Tambahkan di paling atas file orderController.js

// ===============================
// 🟢 Buat pesanan baru
// ===============================
exports.createOrder = async (req, res, next) => {
  try {
    const { userId: rawUserId, customer_name, items, totalPrice, notes, order_status } = req.body;

    // Validasi awal
    if (!customer_name || !Array.isArray(items) || items.length === 0) {
      throw new HttpError('Data pesanan tidak lengkap atau format items salah', 400);
    }

    // ✅ Normalisasi userId ke integer (fallback 999 jika tidak valid)
    let userId = Number.parseInt(String(rawUserId), 10);
    if (!Number.isFinite(userId)) userId = 999;

    let calculatedTotalPrice = 0;
    const detailedItems = [];

    // 🔁 Validasi & hitung total dari sumber kebenaran (Inventory)
    for (const item of items) {
      const pid = item.productId ?? item.product_id;
      const qty = Number(item.qty ?? item.quantity);
      if (!pid || !qty) {
        throw new HttpError('Setiap item harus punya productId dan qty', 400);
      }

      const product = await inventoryService.getProductById(pid);
      if (!product || !product.id) {
        throw new HttpError(`Produk dengan ID ${pid} tidak ditemukan`, 404);
      }

      const harga = Number(product.harga) || 0;
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

    const finalTotalPrice = Number.isFinite(Number(totalPrice))
      ? Number(totalPrice)
      : calculatedTotalPrice;

    // 💾 Simpan ke DB
    const result = await Order.create({
      userId,
      customer_name,
      items: detailedItems,
      totalPrice: finalTotalPrice,
      notes: (notes && String(notes).trim()) || null,
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
        notes: (notes && String(notes).trim()) || null,
        order_status: order_status || 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customer_name, items, notes, totalPrice, extra } = req.body;

    // Pastikan order ada
    const existing = await Order.findById(id);
    if (!existing) throw new HttpError('Pesanan tidak ditemukan', 404);

    // Siapkan nilai default dari data lama
    let detailedItems = [];
    let finalTotal = Number(existing.totalPrice) || 0;

    // Jika client mengirim items, hitung ulang persis seperti createOrder
    if (Array.isArray(items) && items.length > 0) {
      detailedItems = [];
      finalTotal = 0;

      for (const item of items) {
        const productId = item.productId || item.product_id;
        const qty = Number(item.qty ?? item.quantity ?? 1);
        if (!productId || !qty) {
          throw new HttpError('Setiap item harus punya productId dan qty', 400);
        }

        const product = await inventoryService.getProductById(productId);
        if (!product || !product.id) {
          throw new HttpError(`Produk dengan ID ${productId} tidak ditemukan`, 404);
        }

        const harga = Number(product.harga) || 0;
        const subtotal = harga * qty;
        finalTotal += subtotal;

        detailedItems.push({
          productId: product.id,
          nama_produk: product.nama_produk,
          harga,
          quantity: qty,
          subtotal,
        });
      }

      // biaya tambahan (jika dikirim dari POS)
      if (extra) finalTotal += Number(extra) || 0;
    } else {
      // kalau items tidak dikirim, gunakan items lama
      detailedItems = JSON.parse(existing.items || '[]');
    }

    const payload = {
      customer_name: customer_name ?? existing.customer_name,
      items: detailedItems,
      totalPrice: totalPrice ?? finalTotal,
      notes: (notes && String(notes).trim()) || null,
    };

    await Order.update(id, payload);

    res.status(200).json({
      message: '✅ Pesanan berhasil diperbarui',
      data: { id, ...payload },
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// 🔵 Ambil semua pesanan (Admin)
// ===============================
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

// ===============================
// 🟣 Ambil pesanan berdasarkan ID
// ===============================
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

// ===============================
// 🧾 Ambil invoice (order + payment)
// ===============================
exports.getInvoiceByOrderId = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 🔹 Ambil data order dari DB
    const order = await Order.findById(id);
    if (!order) throw new HttpError('Pesanan tidak ditemukan', 404);

    order.items = JSON.parse(order.items || '[]');

    // 🔹 Ambil data payment dari kasir_service (via HTTP)
    const paymentResponse = await axios.get(`http://localhost:4002/api/orders/${id}/payments`);
    const payment = paymentResponse.data?.data || [];

    res.status(200).json({
      message: '🧾 Invoice berhasil diambil',
      data: {
        order,
        payment: payment.length ? payment : { message: 'Belum ada pembayaran untuk pesanan ini' },
      },
    });
  } catch (error) {
    console.error('Invoice error:', error.message);
    next(new HttpError('Gagal mengambil invoice, coba lagi nanti', 500));
  }
};

// ===============================
// 🟢 Ambil pesanan berdasarkan userId
// ===============================
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

// ===============================
// 🟠 Ubah status pesanan
// ===============================
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

// ===============================
// 🔴 Hapus pesanan
// ===============================
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
