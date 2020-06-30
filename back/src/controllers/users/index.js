const express = require('express');
const router = express.Router();

const verifyUserExists = require('./verify-exists');

router.get('/', require('./list'));
router.post('/', require('./store'));
router.get('/:userId', verifyUserExists, require('./show'));
router.put('/:userId', verifyUserExists, require('./update'));
router.delete('/:userId', verifyUserExists, require('./delete'));
router.put('/:userId/enable', verifyUserExists, require('./enable'));

module.exports = router;
