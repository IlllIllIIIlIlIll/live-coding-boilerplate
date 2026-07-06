const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/pemilik', require('./pemilik.routes'));
router.use('/units', require('./unit.routes'));
router.use('/tagihan', require('./tagihan.routes'));
router.use('/push', require('./push.routes'));

module.exports = router;
