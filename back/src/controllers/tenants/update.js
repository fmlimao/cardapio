const Validator = require('validatorjs');
const messagesValidator = require('../../validators/messages');
const knex = require('../../database/connection');
const slug = require('slug');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields(['name']);

    try {
        const tenantId = req.tenant.tenant_id;

        let { name } = req.body;
        let error = false;

        if (typeof name === 'undefined') name = '';

        name = String(name).trim();

        const data = {
            name,
        };

        const datatableValidation = new Validator(data, {
            name: 'string|min:3',
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

        const changes = {};
        let hasChange = false;

        if (name) {
            hasChange = true;
            changes.name = name;
        }

        if (!hasChange) {
            ret.setCode(400);
            ret.addMessage('É necessário alterar alguma informação.');
            throw new Error();
        }

        const tenantExists = await knex('tenants')
            .where('deleted_at', null)
            .where('name', name)
            .where('tenant_id', '!=', tenantId)
            .first();

        if (tenantExists) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            ret.setFieldError('name', true, 'Já existe um inquilino cadastrado com esse nome.');
            throw new Error();
        }

        const slugName = slug(name);

        await knex('tenants')
            .where('tenant_id', tenantId)
            .update({
                name,
                slug: slugName,
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
