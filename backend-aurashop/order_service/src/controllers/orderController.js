const Order = require('../models/orderModel');

// 🟢 Buat pesanan baru
exports.createOrder = async (req, res, next) => {
  try {
    const { userId, items, totalPrice, status } = req.body;
    if (!userId || !items || !totalPrice)
      return res.status(400).json({ message: 'Data pesanan tidak lengkap' });

    const order = await Order.create({
      userId,
      items,
      totalPrice,
      status: status || 'pending',
    });

    res.status(201).json({
      message: '✅ Pesanan berhasil dibuat',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// 🔵 Ambil semua pesanan
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json({
      message: '📦 Daftar pesanan berhasil diambil',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// 🟣 Ambil satu pesanan berdasarkan ID
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order)
      return res.status(404).json({ message: '❌ Pesanan tidak ditemukan' });

    res.status(200).json({
      message: '📄 Detail pesanan berhasil diambil',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// 🟠 Ubah status pesanan
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(404).json({ message: '❌ Pesanan tidak ditemukan' });
    if (!status) return res.status(400).json({ message: 'Status baru harus diisi' });

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    res.status(200).json({
      message: `🟢 Status pesanan diubah dari "${oldStatus}" ke "${status}"`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// 🔴 Hapus pesanan
exports.deleteOrder = async (req, res, next) => {
  try {
    const deleted = await Order.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: '❌ Pesanan tidak ditemukan' });

    res.status(200).json({ message: '🗑️ Pesanan berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
