const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;

    try {
        const tenantId = req.tenant.tenant_id;

        await knex('tenants')
            .where('tenant_id', tenantId)
            .update({
                deleted_at: knex.fn.now(),
            });

        // ret.setCode(204);
        ret.addMessage('Inquilino removido com sucesso.');

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
