module.exports = (err, req, res, next) => {
  // Log error lengkap di server console
  console.error('🔥 [ERROR HANDLER]', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Tentukan status code (default 500)
  const statusCode = err.status || 500;

  // Kirim respons JSON
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    }),
  });
};
