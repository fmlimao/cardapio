const express = require('express');
const router = express.Router();

router.post('/', require('./auth'));
router.get('/reset-password/:hash', require('./reset-password-verify'));
router.post('/reset-password/:hash', require('./reset-password'));
router.post('/send-reset-password', require('./send-reset-password'));

module.exports = router;
