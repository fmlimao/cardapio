const knex = require('../database/connection');

module.exports = async (req, res, next) => {
    const ret = req.ret;

    try {
        let { tenantSlug } = req.params;

        const tenant = await knex('tenants')
            .where('deleted_at', null)
            .where('active', 1)
            .where('slug', tenantSlug)
            .select('tenant_id', 'name', 'slug')
            .first();

        if (!tenant) {
            ret.setCode(404);
            ret.addMessage('Inquilino não encontrado.');
            throw new Error();
        }

        req.tenant = tenant;
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
