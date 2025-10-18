module.exports = (err, req, res, next) => {
  // Log error lengkap di console
  console.error('🔥 [ERROR HANDLER]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Gunakan status dari error custom (HttpError) atau default 500
  const statusCode = err.status || err.statusCode || 500;

  // Respons JSON standar
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV !== 'production' && {
      errorName: err.name,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    }),
  });
};
