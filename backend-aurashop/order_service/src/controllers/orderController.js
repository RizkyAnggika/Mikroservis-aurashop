const Order = require('../models/orderModel');

// 🟢 Buat pesanan baru
exports.createOrder = async (req, res, next) => {
  try {
    const { userId, items, status } = req.body;

    // Validasi data
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Data pesanan tidak lengkap atau format items salah' });
    }

    // Hitung total harga otomatis dari items
    const totalPrice = items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.qty) || 1;
      return sum + price * qty;
    }, 0);

    // Buat pesanan baru
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
