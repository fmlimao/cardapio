const knex = require('../database/connection');

module.exports = async (req, res, next) => {
    const ret = req.ret;

    try {
        let { userId } = req.params;

        const user = await knex('users')
            .where('deleted_at', null)
            .where('user_id', userId)
            .where('tenant_id', req.tenant.tenant_id)
            .select('user_id', 'name', 'email', 'admin', 'active')
            .first();

        if (!user) {
            ret.setCode(404);
            ret.addMessage('Usuário não encontrado.');
            throw new Error();
        }

        req.user = user;
    } catch (err) {
        ret.setError(true);

        if (ret.getCode() === 200) {
            ret.setCode(500);
        }

        if (err.message) {
            ret.addMessage(err.message);
        }

        return res.status(ret.getCode()).json(ret.generate());
    }

    next();
};
