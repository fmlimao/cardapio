const jwt = require('jsonwebtoken');
const knex = require('../../database/connection');

const JsonReturn = require('../../helpers/json-return');

module.exports = async (req, res, next) => {
    const ret = new JsonReturn();

    try {
        if (!req.auth.user.sysadmin) {
            ret.setCode(401);
            ret.addMessage('Usuário não tem permissão.');
            throw new Error();
        }
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
