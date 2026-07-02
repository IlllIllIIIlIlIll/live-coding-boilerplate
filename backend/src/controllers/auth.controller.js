const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const otpService = require('../services/otp.service');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

// POST /api/auth/otp/request  { target } -> target = email
async function requestOtp(req, res, next) {
  try {
    const { target } = req.body;

    if (!target) {
      return res.status(400).json({ message: 'target wajib diisi' });
    }

    const { kode, expired_at } = otpService.generateOtp(target);

    // Untuk kebutuhan tes: OTP dikembalikan di response (bukan email gateway asli).
    console.log(`[OTP] target=${target} kode=${kode} expired_at=${expired_at.toISOString()}`);
    res.json({ message: 'OTP berhasil dibuat', kode_otp: kode, expired_at });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/otp/verify  { target, kode_otp }
// Kebijakan: jika belum ada user dengan email tersebut, login ditolak (403) —
// hanya admin yang boleh membuat akun pemilik (lihat CRUD Pemilik).
async function verifyOtpLogin(req, res, next) {
  try {
    const { target, kode_otp } = req.body;

    if (!target || !kode_otp) {
      return res.status(400).json({ message: 'target dan kode_otp wajib diisi' });
    }

    const valid = otpService.verifyOtp(target, kode_otp);
    if (!valid) {
      return res.status(401).json({ message: 'Kode OTP tidak valid atau kedaluwarsa' });
    }

    const user = await User.findOne({ where: { email: target } });
    if (!user) {
      return res.status(403).json({ message: 'Akun untuk email ini belum terdaftar' });
    }

    const token = signToken(user);
    const { password: _password, ...userData } = user.toJSON();

    res.json({ token, user: userData });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login  { identifier, password }
async function loginWithPassword(req, res, next) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'identifier dan password wajib diisi' });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { no_hp: identifier }],
      },
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    const token = signToken(user);
    const { password: _password, ...userData } = user.toJSON();

    res.json({ token, user: userData });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  res.json({ user: req.user });
}

// GET /api/auth/google/callback (dipanggil setelah passport.authenticate berhasil)
function googleCallback(req, res) {
  const token = signToken(req.user);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/login?token=${token}`);
}

module.exports = {
  requestOtp,
  verifyOtpLogin,
  loginWithPassword,
  getMe,
  googleCallback,
};
