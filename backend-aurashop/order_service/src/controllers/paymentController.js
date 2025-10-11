const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');

exports.createPayment = async (req, res) => {
  try {
    const { id } = req.params; // orderId
    const { paymentMethod, amount } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    if (order.status === 'paid') return res.status(400).json({ message: 'Pesanan sudah dibayar' });

    if (parseFloat(amount) !== parseFloat(order.totalPrice)) {
      return res.status(400).json({ message: 'Jumlah pembayaran tidak sesuai total pesanan' });
    }

    const payment = await Payment.create({
      orderId: id,
      paymentMethod,
      amount,
      status: 'success',
    });

    // Update status order
    order.status = 'paid';
    await order.save();

    res.status(201).json({
      message: '💰 Pembayaran berhasil',
      data: { order, payment },
    });
  } catch (error) {
    console.error('❌ Payment error:', error);
    res.status(500).json({ message: 'Gagal memproses pembayaran', error: error.message });
  }
};
