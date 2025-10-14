const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');

// 🟢 Buat pembayaran untuk order
exports.createPayment = (req, res) => {
  const orderId = req.params.id;
  const { paymentMethod, amount } = req.body;

  if (!paymentMethod || !amount) {
    return res.status(400).json({ message: 'Metode pembayaran dan jumlah wajib diisi' });
  }

  // 🔍 Cek apakah order ada
  Order.findById(orderId, (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data order', error: err });
    if (result.length === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

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
      (err, paymentResult) => {
        if (err) return res.status(500).json({ message: 'Gagal membuat pembayaran', error: err });

        // 🔄 Update status order jadi 'paid'
        Order.updateStatus(orderId, 'paid', (err2) => {
          if (err2)
            return res.status(500).json({ message: 'Gagal memperbarui status order', error: err2 });

          res.status(201).json({
            message: '💰 Pembayaran berhasil',
            data: {
              order: { ...order, order_status: 'paid' },
              payment: { id: paymentResult.insertId, orderId, paymentMethod, amount, status: 'success' },
            },
          });
        });
      }
    );
  });
};
