const express = require('express');
const router = express.Router();

const verifyTenantExists = require('./verify-exists');
const verifyUserExists = require('./users/verify-exists');
const verifyCategoryExists = require('./categories/verify-exists');

router.get('/', require('./list'));
router.post('/', require('./store'));
router.get('/:tenantId', verifyTenantExists, require('./show'));
router.put('/:tenantId', verifyTenantExists, require('./update'));
router.delete('/:tenantId', verifyTenantExists, require('./delete'));
router.put('/:tenantId/enable', verifyTenantExists, require('./enable'));

router.get('/:tenantId/users', verifyTenantExists, require('./users/list'));
router.post('/:tenantId/users', verifyTenantExists, require('./users/store'));
router.get('/:tenantId/users/:userId', verifyTenantExists, verifyUserExists, require('./users/show'));
router.put('/:tenantId/users/:userId', verifyTenantExists, verifyUserExists, require('./users/update'));
router.delete('/:tenantId/users/:userId', verifyTenantExists, verifyUserExists, require('./users/delete'));
router.put('/:tenantId/users/:userId/enable', verifyTenantExists, verifyUserExists, require('./users/enable'));

router.get('/:tenantId/categories', verifyTenantExists, require('./categories/list'));
router.post('/:tenantId/categories', verifyTenantExists, require('./categories/store'));
router.get('/:tenantId/categories/:categoryId', verifyTenantExists, verifyCategoryExists, require('./categories/show'));
router.put('/:tenantId/categories/:categoryId', verifyTenantExists, verifyCategoryExists, require('./categories/update'));
router.delete('/:tenantId/categories/:categoryId', verifyTenantExists, verifyCategoryExists, require('./categories/delete'));
router.put('/:tenantId/categories/:categoryId/enable', verifyTenantExists, verifyCategoryExists, require('./categories/enable'));

module.exports = router;
