const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');
const inventoryService = require('../services/inventoryService'); // 🧩 koneksi ke Inventory Service

// 🟢 Buat pembayaran untuk order
exports.createPayment = (req, res) => {
  const orderId = req.params.id;
  const { paymentMethod, amount } = req.body;

  // Validasi input dasar
  if (!paymentMethod || !amount) {
    return res.status(400).json({ message: 'Metode pembayaran dan jumlah wajib diisi' });
  }

  // 🔍 Cek apakah order ada
  Order.findById(orderId, async (err, result) => {
    if (err)
      return res.status(500).json({ message: 'Gagal mengambil data order', error: err });

    if (result.length === 0)
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

    const order = result[0];

    if (order.order_status === 'paid') {
      return res.status(400).json({ message: 'Pesanan sudah dibayar' });
    }

    if (parseFloat(amount) !== parseFloat(order.totalPrice)) {
      return res.status(400).json({ message: 'Jumlah pembayaran tidak sesuai total pesanan' });
    }

    // 💳 Simpan data pembayaran
    Payment.create(
      {
        orderId,
        paymentMethod,
        amount,
        status: 'success',
      },
      async (err, paymentResult) => {
        if (err)
          return res.status(500).json({ message: 'Gagal membuat pembayaran', error: err });

        // 🔄 Update status order jadi 'paid'
        Order.updateStatus(orderId, 'paid', async (err2) => {
          if (err2)
            return res.status(500).json({
              message: 'Gagal memperbarui status order',
              error: err2,
            });

          try {
            // 🧾 Ambil daftar item produk dari order
            const orderItems = JSON.parse(order.items || '[]');

            // 🔽 Kurangi stok tiap produk lewat Inventory Service
            for (const item of orderItems) {
              // Validasi agar tidak error kalau data rusak
              if (!item.productId || !item.quantity) continue;
              await inventoryService.reduceStock(item.productId, item.quantity);
            }

            // ✅ Respon sukses
            return res.status(201).json({
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
          } catch (reduceError) {
            console.error('❌ Error saat update stok:', reduceError.message);
            return res.status(500).json({
              message: 'Pembayaran berhasil tapi gagal memperbarui stok produk',
            });
          }
        });
      }
    );
  });
};
