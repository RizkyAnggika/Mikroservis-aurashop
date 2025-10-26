// 📁 payment_service/controllers/paymentController.js
const Payment = require('../models/paymentModel');
const inventoryService = require('../services/inventoryService');
const orderService = require('../services/orderService');
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
      message: payments.length ? 'Riwayat pembayaran ditemukan' : 'Belum ada pembayaran',
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};


// 🗂️ Ambil semua pembayaran (opsional: filter & pagination)
exports.getAllPayments = async (req, res, next) => {
  try {
    // query: ?page=1&limit=50&status=success&paymentMethod=cash&orderId=123
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const filters = {
      status: req.query.status,                // "success" | "failed" | dll
      paymentMethod: req.query.paymentMethod,  // "cash" | "qris" | "card" | dll
      orderId: req.query.orderId               // id order tertentu
    };

    let result;

    // Jika model mendukung findAll dengan options (offset/limit/filter)
    if (typeof Payment.findAll === "function" && Payment.findAll.length >= 1) {
      result = await Payment.findAll({ offset, limit, ...filters, order: "DESC" });
    } 
    // Fallback ke getAll / all bila ada
    else if (typeof Payment.getAll === "function") {
      result = await Payment.getAll();
    } else if (typeof Payment.all === "function") {
      result = await Payment.all();
    } 
    // Fallback paling simpel
    else if (typeof Payment.findAll === "function") {
      result = await Payment.findAll();
    } 
    else {
      throw new HttpError("Model Payment belum mendukung pengambilan semua data (findAll/getAll).", 500);
    }

    // Jika result array penuh, kita filter & paginate di controller (aman untuk dataset kecil)
    let rows = Array.isArray(result) ? result : (result?.rows || result?.data || []);
    if (!Array.isArray(rows)) rows = [];

    // Filter ringan di sisi controller (hanya bila model tak dukung filter)
    const hasModelSideFilter = !(typeof Payment.findAll === "function" && Payment.findAll.length >= 1);
    if (hasModelSideFilter) {
      rows = rows.filter((p) => {
        const okStatus = !filters.status || String(p.status).toLowerCase() === String(filters.status).toLowerCase();
        const okMethod = !filters.paymentMethod || String(p.paymentMethod).toLowerCase() === String(filters.paymentMethod).toLowerCase();
        const okOrder  = !filters.orderId || String(p.orderId) === String(filters.orderId);
        return okStatus && okMethod && okOrder;
      });

      // Urutkan terbaru dulu bila ada created_at
      rows.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

      // Pagination manual
      rows = rows.slice(offset, offset + limit);
    }

    res.status(200).json({
      message: "Daftar pembayaran ditemukan",
      page,
      limit,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Hapus 1 pembayaran + order yang terkait
exports.deletePay = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 🔍 Ambil data payment dulu dari DB
    const payment = await Payment.findById(id);
    if (!payment) throw new HttpError("Pembayaran tidak ditemukan", 404);

    const orderId = payment.orderId;

    // 🗑️ Hapus payment
    const result = await Payment.deleteById(id);
    if (result.affectedRows === 0) throw new HttpError('Gagal menghapus payment', 500);

    // 🗑️ Hapus order (panggil ke order-service)
    await orderService.deleteOrder(orderId);

    res.status(200).json({
      message: `Pembayaran #${id} dan order #${orderId} berhasil dihapus`,
    });
  } catch (error) {
    next(error);
  }
};

