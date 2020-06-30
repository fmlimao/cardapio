require("dotenv-safe").config();
const express = require('express');

const middlewareAuth = require('./controllers/auth/verify');
const middlewareAuthSysAdmin = require('./controllers/auth/verify-sysadmin');
const middlewareAdmin = require('./controllers/auth/verify-admin');

const router = express.Router();

router.get('/', (req, res) => {
    return res.json({
        status: 'ok',
    });
});

router.use('/auth', require('./controllers/auth'));

router.use(middlewareAuth);

router.use('/tenants', middlewareAuthSysAdmin, require('./controllers/tenants'));
router.use('/users', middlewareAuthSysAdmin, require('./controllers/users'));

module.exports = router;
