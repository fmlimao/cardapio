const jwt = require('jsonwebtoken');
const knex = require('../database/connection');

const JsonReturn = require('../helpers/json-return');

module.exports = async (req, res, next) => {
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
            .leftJoin('tenants', function () {
                this.on('users.tenant_id', 'tenants.tenant_id')
                    .andOnNull('tenants.deleted_at')
                    .andOn('tenants.active', 1);
            })
            .where('users.deleted_at', null)
            .where('users.active', 1)
            .where('users.request_password_change', 0)
            .where('users.user_id', decodedToken.id)
            .select('users.user_id', 'users.name', 'users.email', 'users.sysadmin', 'users.admin', 'tenants.tenant_id', 'tenants.name as tenants_name', 'tenants.slug as tenants_slug')
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

        req.auth = {
            user,
        };
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
};
