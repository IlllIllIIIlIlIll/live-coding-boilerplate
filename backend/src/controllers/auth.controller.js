const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');

/**
 * TODO: implementasikan 2 metode login yang tersisa sesuai SPEC.md bagian 5:
 * (1) Email + OTP, (3) Google.
 */

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

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

module.exports = {
  requestOtp,
  verifyOtpLogin,
  loginWithPassword,
  getMe,
};
