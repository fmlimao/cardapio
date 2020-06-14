const express = require('express');
const router = express.Router();

router.get('/', require('./list'));
router.post('/', require('./store'));
router.get('/:tenantId', require('./show'));
router.put('/:tenantId', require('./update'));
router.delete('/:tenantId', require('./delete'));
router.put('/:tenantId/enable', require('./enable'));
router.put('/:tenantId/disable', require('./enable'));

module.exports = router;
