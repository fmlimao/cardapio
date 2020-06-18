require("dotenv-safe").config();
const express = require('express');

const middlewareAuth = require('./controllers/auth/verify');
const middlewareSysAdmin = require('./controllers/auth/verify-sysadmin');

const router = express.Router();

router.get('/', (req, res) => {
    return res.json({
        status: 'ok',
    });
});

router.use('/auth', require('./controllers/auth'));

router.use(middlewareAuth);

router.use('/tenants', middlewareSysAdmin, require('./controllers/tenants'));
router.use('/users', middlewareSysAdmin, require('./controllers/users'));

module.exports = router;
