const Validator = require('validatorjs');
const messagesValidator = require('../../validators/messages');
const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields(['active']);

    try {
        const tenantId = req.tenant.tenant_id;

        let { active } = req.body;

        if (typeof active === 'undefined') active = '';

        active = String(active).trim();

        const data = {
            active,
        };

        const datatableValidation = new Validator(data, {
            active: 'required|integer|min:0|max:1',
        }, messagesValidator);
        const fails = datatableValidation.fails();
        const errors = datatableValidation.errors.all();

        if (fails) {
            for (let field in errors) {
                let messages = errors[field];
                ret.setFieldError(field, true);

                for (let i in messages) {
                    let message = messages[i];
                    ret.addFieldMessage(field, message);
                }
            }

            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        await knex('tenants')
            .where('tenant_id', tenantId)
            .update({
                active: Number(active),
            });

        const updatedTenant = await knex('tenants')
            .where('tenant_id', tenantId)
            .select('tenant_id', 'name', 'slug', 'whatsapp', 'active')
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
