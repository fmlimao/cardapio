const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;

    try {
        const { tenantId } = req.params;

        const currentTenant = await knex('tenants')
            .where('deletedAt', null)
            .where('tenant_id', tenantId)
            .first();

        if (!currentTenant) {
            ret.setCode(404);
            ret.addMessage('Inquilino não encontrado.');
            throw new Error();
        }

        await knex('tenants')
            .where('tenant_id', tenantId)
            .update({
                deletedAt: knex.fn.now(),
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
