/* eslint-disable no-unused-vars */
function errorMiddleware(err, req, res, next) {
  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: err.errors?.map((e) => e.message).join(', ') || 'Data tidak valid',
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      message: 'Data masih terkait dengan data lain, tidak dapat diproses',
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Terjadi kesalahan pada server',
  });
}

module.exports = errorMiddleware;
