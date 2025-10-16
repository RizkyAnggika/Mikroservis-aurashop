module.exports = (err, req, res, next) => {
  console.error('🔥 Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    // opsional tambahan untuk debug
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
