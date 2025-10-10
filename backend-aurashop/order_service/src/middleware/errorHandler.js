// Middleware global untuk tangani semua error
module.exports = (err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan pada server',
  });
};
