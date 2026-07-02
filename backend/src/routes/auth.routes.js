const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/otp/request', authController.requestOtp);
router.post('/otp/verify', authController.verifyOtpLogin);
router.post('/login', authController.loginWithPassword);
router.get('/me', authMiddleware, authController.getMe);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  authController.googleCallback
);
router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Login Google gagal' });
});

module.exports = router;
