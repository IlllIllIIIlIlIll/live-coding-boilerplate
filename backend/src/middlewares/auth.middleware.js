const jwt = require('jsonwebtoken');

/**
 * TODO: implementasikan verifikasi JWT.
 * - Ambil token dari header Authorization: Bearer <token>
 * - Jika tidak ada token -> balas 401
 * - Verifikasi dengan jwt.verify(token, process.env.JWT_SECRET)
 * - Jika valid, tempelkan payload ke req.user lalu panggil next()
 * - Jika invalid/expired -> balas 401
 */
function authMiddleware(req, res, next) {
  res.status(501).json({ message: 'authMiddleware belum diimplementasikan' });
}

module.exports = authMiddleware;
