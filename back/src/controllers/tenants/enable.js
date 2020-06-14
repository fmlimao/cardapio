const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields(['enable']);

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

        let { enable } = req.body;
        let error = false;

        if (typeof enable == 'undefined') {
            error = true;
            ret.setFieldError('enable', true, 'Campo obrigatório.');
        } else {
            enable = Number(enable);
            if (enable !== 0 && enable !== 1) {
                error = true;
                ret.setFieldError('enable', true, 'Este campo precisa ser "0" ou "1".');
            }
        }

        if (error) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        await knex('tenants')
            .where('tenant_id', tenantId)
            .update({
                active: Number(enable),
            });

        const updatedTenant = await knex('tenants')
            .where('tenant_id', tenantId)
            .select('tenant_id', 'name', 'slug', 'active')
            .first();

        ret.addContent('tenant', updatedTenant);

        ret.setCode(200);
        ret.addMessage('Inquilino editado com sucesso.');

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
