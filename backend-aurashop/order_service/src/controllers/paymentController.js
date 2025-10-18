const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');
const inventoryService = require('../services/inventoryService');
const HttpError = require('../utils/HttpError');

// 🟢 Buat pembayaran untuk order
exports.createPayment = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { paymentMethod, amount } = req.body;

    if (!paymentMethod || !amount) {
      throw new HttpError('Metode pembayaran dan jumlah wajib diisi', 400);
    }

    // 🔍 Ambil data order
    const orders = await new Promise((resolve, reject) => {
      Order.findById(orderId, (err, result) => (err ? reject(err) : resolve(result)));
    });

    if (orders.length === 0) throw new HttpError('Pesanan tidak ditemukan', 404);

    const order = orders[0];

    if (order.order_status === 'paid') {
      throw new HttpError('Pesanan sudah dibayar', 400);
    }

    if (parseFloat(amount) !== parseFloat(order.totalPrice)) {
      throw new HttpError('Jumlah pembayaran tidak sesuai total pesanan', 400);
    }

    // 💳 Simpan data pembayaran
    const paymentResult = await new Promise((resolve, reject) => {
      Payment.create(
        {
          orderId,
          paymentMethod,
          amount,
          status: 'success',
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
    });

    // 🔄 Update status order jadi 'paid'
    await new Promise((resolve, reject) => {
      Order.updateStatus(orderId, 'paid', (err, result) => (err ? reject(err) : resolve(result)));
    });

    // 🧾 Ambil daftar item dari order dan kurangi stok
    try {
      const orderItems = JSON.parse(order.items || '[]');

      for (const item of orderItems) {
        if (!item.productId || !item.quantity) continue;
        await inventoryService.reduceStock(item.productId, item.quantity);
      }
    } catch (reduceError) {
      console.error('❌ Error saat update stok:', reduceError.message);
      // stok gagal update tapi pembayaran tetap sukses
      throw new HttpError('Pembayaran berhasil tapi gagal memperbarui stok produk', 500);
    }

    // ✅ Respon sukses
    res.status(201).json({
      message: '💰 Pembayaran berhasil dan stok produk diperbarui',
      data: {
        order: { ...order, order_status: 'paid' },
        payment: {
          id: paymentResult.insertId,
          orderId,
          paymentMethod,
          amount,
          status: 'success',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
