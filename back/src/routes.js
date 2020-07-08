require("dotenv-safe").config();

const express = require('express');
const router = express.Router();

/* Middlewares Globais */
const middlewareJsonReturn = require('./middlewares/json-return');

/* Middlewares de Autenticação */
const middlewareAuth = require('./middlewares/auth');
const middlewareAuthSysAdmin = require('./middlewares/auth-sysadmin');
const middlewareAuthAdmin = require('./middlewares/auth-admin');

/* Middlewares de Verificação */
const middlewareVerifyUserExists = require('./middlewares/verify-user-exists');
const middlewareVerifyTenantExists = require('./middlewares/verify-tenant-exists');
const middlewareVerifyTenantUserExists = require('./middlewares/verify-tenant-user-exists');
const middlewareVerifyCategoryExists = require('./middlewares/verify-tenant-category-exists');
const middlewareVerifyProductExists = require('./middlewares/verify-tenant-category-product-exists');

router.use(middlewareJsonReturn);

/* Status da API */
router.get('/', require('./controllers/home'));

/* Autenticação */
router.post('/auth', require('./controllers/auth/auth'));
router.get('/auth/reset-password/:hash', require('./controllers/auth/reset-password-verify'));
router.post('/auth/reset-password/:hash', require('./controllers/auth/reset-password'));
router.post('/auth/send-reset-password', require('./controllers/auth/send-reset-password'));

/* Usuários Sysadmin */
router.post('/users', middlewareAuth, middlewareAuthSysAdmin, require('./controllers/users/store'));
router.get('/users', middlewareAuth, middlewareAuthSysAdmin, require('./controllers/users/list'));
router.get('/users/:userId', middlewareAuth, middlewareAuthSysAdmin, middlewareVerifyUserExists, require('./controllers/users/show'));
router.put('/users/:userId', middlewareAuth, middlewareAuthSysAdmin, middlewareVerifyUserExists, require('./controllers/users/update'));
router.put('/users/:userId/active', middlewareAuth, middlewareAuthSysAdmin, middlewareVerifyUserExists, require('./controllers/users/active'));
router.delete('/users/:userId', middlewareAuth, middlewareAuthSysAdmin, middlewareVerifyUserExists, require('./controllers/users/delete'));

/* Inquilinos */
router.post('/tenants', require('./controllers/tenants/store'));
router.get('/tenants', middlewareAuth, middlewareAuthSysAdmin, require('./controllers/tenants/list'));
router.get('/tenants/:tenantId', middlewareAuth, middlewareAuthSysAdmin, middlewareVerifyTenantExists, require('./controllers/tenants/show'));
router.put('/tenants/:tenantId', middlewareAuth, middlewareAuthSysAdmin, middlewareVerifyTenantExists, require('./controllers/tenants/update'));
router.put('/tenants/:tenantId/active', middlewareAuth, middlewareAuthSysAdmin, middlewareVerifyTenantExists, require('./controllers/tenants/active'));
router.delete('/tenants/:tenantId', middlewareAuth, middlewareAuthSysAdmin, middlewareVerifyTenantExists, require('./controllers/tenants/delete'));

/* Inquilinos - Usuários */
router.post('/tenants/:tenantId/users', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, require('./controllers/tenants/users/store'));
router.get('/tenants/:tenantId/users', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, require('./controllers/tenants/users/list'));
router.get('/tenants/:tenantId/users/:userId', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyTenantUserExists, require('./controllers/tenants/users/show'));
router.put('/tenants/:tenantId/users/:userId', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyTenantUserExists, require('./controllers/tenants/users/update'));
router.put('/tenants/:tenantId/users/:userId/active', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyTenantUserExists, require('./controllers/tenants/users/active'));
router.delete('/tenants/:tenantId/users/:userId', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyTenantUserExists, require('./controllers/tenants/users/delete'));

/* Iquilinos - Categorias */
router.post('/tenants/:tenantId/categories', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, require('./controllers/tenants/categories/store'));
router.get('/tenants/:tenantId/categories', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, require('./controllers/tenants/categories/list'));
router.get('/tenants/:tenantId/categories/:categoryId', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, require('./controllers/tenants/categories/show'));
router.put('/tenants/:tenantId/categories/:categoryId', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, require('./controllers/tenants/categories/update'));
router.put('/tenants/:tenantId/categories/:categoryId/active', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, require('./controllers/tenants/categories/active'));
router.delete('/tenants/:tenantId/categories/:categoryId', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, require('./controllers/tenants/categories/delete'));

/* Iquilinos - Categorias - Produtos */
router.post('/tenants/:tenantId/categories/:categoryId/products', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, require('./controllers/tenants/products/store'));
router.get('/tenants/:tenantId/categories/:categoryId/products', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, require('./controllers/tenants/products/list'));
router.get('/tenants/:tenantId/categories/:categoryId/products/:productId', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, middlewareVerifyProductExists, require('./controllers/tenants/products/show'));
router.put('/tenants/:tenantId/categories/:categoryId/products/:productId', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, middlewareVerifyProductExists, require('./controllers/tenants/products/update'));
router.put('/tenants/:tenantId/categories/:categoryId/products/:productId/active', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, middlewareVerifyProductExists, require('./controllers/tenants/products/active'));
router.delete('/tenants/:tenantId/categories/:categoryId/products/:productId', middlewareAuth, middlewareAuthAdmin, middlewareVerifyTenantExists, middlewareVerifyCategoryExists, middlewareVerifyProductExists, require('./controllers/tenants/products/delete'));

module.exports = router;
