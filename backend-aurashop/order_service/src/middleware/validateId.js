module.exports = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID pesanan tidak valid',
    });
  }
  next();
};
