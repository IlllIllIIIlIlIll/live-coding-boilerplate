const express = require('express');
const router = express.Router();
const pushController = require('../controllers/push.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware, roleMiddleware(['admin', 'pemilik']));

router.get('/vapid-public-key', pushController.getVapidPublicKey);
router.post('/subscribe', pushController.subscribe);
router.post('/unsubscribe', pushController.unsubscribe);
router.post('/register-fcm-token', pushController.registerFcmToken);
router.post('/check-now', pushController.checkNow);

module.exports = router;
