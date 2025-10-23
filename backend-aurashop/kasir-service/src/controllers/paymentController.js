// 📁 payment_service/controllers/paymentController.js
const Payment = require('../models/paymentModel');
const orderService = require('../services/orderService');
const inventoryService = require('../services/inventoryService');
const HttpError = require('../utils/HttpError');

// 🟢 Membuat pembayaran untuk order tertentu
exports.createPayment = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { paymentMethod, amount } = req.body;

    // Validasi payload
    if (!paymentMethod || amount === undefined || amount === null) {
      throw new HttpError('Metode pembayaran dan jumlah wajib diisi', 400);
    }
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      throw new HttpError('Jumlah pembayaran tidak valid', 400);
    }

    // 🔍 Ambil data order dari microservice order
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new HttpError('Pesanan tidak ditemukan', 404);
    }

    if (String(order.order_status).toLowerCase() === 'paid') {
      throw new HttpError('Pesanan sudah dibayar', 400);
    }

    const orderTotal = Number(order.totalPrice);
    if (!Number.isFinite(orderTotal)) {
      throw new HttpError('Total pesanan tidak valid pada data order', 500);
    }
    if (amountNum !== orderTotal) {
      throw new HttpError('Jumlah pembayaran tidak sesuai total pesanan', 400);
    }

    // 💳 Simpan data pembayaran di DB kasir
    const paymentResult = await Payment.create({
      orderId,
      paymentMethod,
      amount: amountNum,
      status: 'success',
    });

    // 🔄 Update status pesanan ke "paid" di order_service
    await orderService.updateOrderStatus(orderId, 'paid');

    // 🧾 Kurangi stok produk via inventory_service
    // SAFETY: order.items bisa array atau string JSON
    let itemsRaw = order.items;
    let orderItems;
    try {
      orderItems = Array.isArray(itemsRaw) ? itemsRaw : JSON.parse(itemsRaw || '[]');
    } catch (e) {
      console.error('❌ Gagal parse order.items:', { itemsRaw });
      throw new HttpError('Format items pada order tidak valid', 500);
    }

    const stockWarnings = [];
    for (const item of orderItems) {
      const productId = item.productId ?? item.product_id;
      const qty = item.quantity ?? item.qty;

      if (!productId || !qty) {
        console.warn('⚠️ Item dilewati (productId/qty tidak valid):', item);
        stockWarnings.push({
          productId,
          qty,
          warning: 'Item dilewati: productId atau qty tidak valid',
        });
        continue;
      }

      try {
        await inventoryService.reduceStock(productId, qty);
      } catch (err) {
        // Jangan gagalkan pembayaran; catat peringatan agar mudah ditelusuri
        console.error('❌ Error reduceStock:', {
          productId,
          qty,
          errMsg: err?.response?.data || err?.message,
        });
        stockWarnings.push({
          productId,
          qty,
          warning: 'Gagal mengurangi stok (lihat log server untuk detail)',
        });
      }
    }

    // ✅ Kirim respon sukses
    res.status(201).json({
      message:
        stockWarnings.length === 0
          ? '💰 Pembayaran berhasil dan stok produk diperbarui'
          : '💰 Pembayaran berhasil. Beberapa stok gagal diperbarui (lihat warnings).',
      data: {
        order: { ...order, order_status: 'paid' },
        payment: {
          id: paymentResult.insertId || paymentResult.id,
          orderId,
          paymentMethod,
          amount: amountNum,
          status: 'success',
        },
        warnings: stockWarnings.length ? stockWarnings : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🧾 Ambil semua pembayaran berdasarkan orderId
exports.getPaymentsByOrder = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

    // Cek apakah order valid dari service order
    const order = await orderService.getOrderById(orderId);
    if (!order) throw new HttpError('Pesanan tidak ditemukan', 404);

    // Ambil data pembayaran dari DB kasir
    const payments = await Payment.findByOrderId(orderId);

    res.status(200).json({
      message: 'Riwayat pembayaran ditemukan',
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
