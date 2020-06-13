const express = require('express');
const router = express.Router();

router.get('/', require('./list'));
// router.post('/', require('./store'));
// router.put('/:tenantId', require('./update'));
// router.delete('/:tenantId', require('./delete'));

module.exports = router;
