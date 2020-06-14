const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;

    try {
        let { tenantId } = req.params;

        const tenant = await knex('tenants')
            .where('deletedAt', null)
            .where('tenant_id', tenantId)
            .select('tenant_id', 'name', 'slug', 'active')
            .first();

        if (!tenant) {
            ret.setCode(404);
            ret.addMessage('Inquilino não encontrado.');
            throw new Error();
        }

        ret.addContent('tenant', tenant);

        return res.status(ret.getCode()).json(ret.generate());
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
};
