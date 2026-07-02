/**
 * TODO: implementasikan 3 metode login sesuai SPEC.md bagian 5:
 * (1) Email + OTP, (2) No HP/Email + Password, (3) Google.
 * Semua metode berujung menerbitkan JWT (lihat jsonwebtoken, env JWT_SECRET/JWT_EXPIRES_IN).
 */

// POST /api/auth/otp/request  { target } -> target = email
async function requestOtp(req, res, next) {
  res.status(501).json({ message: 'requestOtp belum diimplementasikan' });
}

// POST /api/auth/otp/verify  { target, kode_otp }
async function verifyOtpLogin(req, res, next) {
  res.status(501).json({ message: 'verifyOtpLogin belum diimplementasikan' });
}

// POST /api/auth/login  { identifier, password }
async function loginWithPassword(req, res, next) {
  res.status(501).json({ message: 'loginWithPassword belum diimplementasikan' });
}

// GET /api/auth/me
async function getMe(req, res, next) {
  res.status(501).json({ message: 'getMe belum diimplementasikan' });
}

module.exports = {
  requestOtp,
  verifyOtpLogin,
  loginWithPassword,
  getMe,
};
