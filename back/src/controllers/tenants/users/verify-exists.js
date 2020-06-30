const knex = require('../../../database/connection');

module.exports = async (req, res, next) => {
    const ret = req.ret;

    try {
        let { userId } = req.params;

        const user = await knex('users')
            .joinRaw(`inner join tenant_users on users.user_id = tenant_users.user_id and tenant_users.deletedAt is null`)
            .joinRaw(`inner join tenants on tenant_users.tenant_id = tenants.tenant_id and tenants.deletedAt is null AND tenants.tenant_id = ${req.tenant.tenant_id}`)
            .where('users.deletedAt', null)
            .where('users.user_id', userId)
            .select('users.user_id', 'users.name', 'users.email', 'users.admin', 'users.active')
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
