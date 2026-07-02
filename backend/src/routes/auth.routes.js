const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/otp/request', authController.requestOtp);
router.post('/otp/verify', authController.verifyOtpLogin);
router.post('/login', authController.loginWithPassword);
router.get('/me', authMiddleware, authController.getMe);

// TODO: integrasi Google OAuth (wajib, salah satu dari 3 metode login)
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallbackHandler);

module.exports = router;
