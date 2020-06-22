const express = require('express');
const router = express.Router();

router.get('/', require('./list'));
router.post('/', require('./store'));
router.get('/:userId', require('./show'));
router.put('/:userId', require('./update'));
router.delete('/:userId', require('./delete'));

module.exports = router;
