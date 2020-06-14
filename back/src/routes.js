require("dotenv-safe").config();
const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('./database/connection');

const JsonReturn = require('./helpers/json-return');

const router = express.Router();

router.get('/', (req, res) => {
    return res.json({
        status: 'ok',
    });
});

router.use('/auth', require('./controllers/auth'));

router.use(async (req, res, next) => {
    const ret = new JsonReturn();

    try {
        const token = req.header('x-access-token');

        if (!token) {
            ret.setCode(401);
            ret.addMessage('Token inválido.');
            throw new Error();
        }

        var decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await knex('users')
            .where('deletedAt', null)
            .where('active', 1)
            .where('request_password_change', 0)
            .where('user_id', decodedToken.id)
            .select('user_id', 'name', 'email', 'admin')
            .first();

        if (!user) {
            ret.setCode(401);
            ret.addMessage('Token inválido.');
            throw new Error();
        }

        const exp = Number(process.env.TOKEN_EXPIRATION_SEC);
        const login = {
            id: user.user_id,
        };
        if (exp) {
            login.exp = Math.floor(Date.now() / 1000) + Number(process.env.TOKEN_EXPIRATION_SEC);
        }

        const refreshToken = jwt.sign(login, process.env.TOKEN_SECRET);
        ret.addContent('refreshToken', refreshToken);

        // const currentTime = parseInt(Date.now() / 1000);
        // const timeDiff = decodedToken.exp - currentTime;

        req.auth = user;
        req.ret = ret;
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            ret.setCode(401);
            ret.addMessage('Token inválido.');
        } else if (err.name === 'TokenExpiredError') {
            ret.setCode(401);
            ret.addMessage('Token expirado.');
        } else {
            ret.setError(true);

            if (ret.getCode() === 200) {
                ret.setCode(500);
            }

            if (err.message) {
                ret.addMessage(err.message);
            }
        }

        return res.status(ret.getCode()).json(ret.generate());
    }

    next();
});

router.use('/tenants', require('./controllers/tenants'));

module.exports = router;
