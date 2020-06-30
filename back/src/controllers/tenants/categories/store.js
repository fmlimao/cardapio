require("dotenv-safe").config();
const Validator = require('validatorjs');
const messagesValidator = require('../../../validators/messages');
const knex = require('../../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields(['name']);

    try {
        let { name } = req.body;

        if (typeof name === 'undefined') name = '';

        name = String(name).trim();

        const data = {
            name,
        };

        const datatableValidation = new Validator(data, {
            name: 'required|string|min:3',
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

        const categoriesExists = await knex('categories')
            .where('deletedAt', null)
            .where('tenant_id', req.tenant.tenant_id)
            .where('name', name)
            .first();

        if (categoriesExists) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            ret.setFieldError('name', true, 'Já existe uma categoria cadastrado com esse nome.');
            throw new Error();
        }

        const categoryId = (await knex('categories')
            .insert({
                tenant_id: req.tenant.tenant_id,
                name: name,
            }))[0];

        const insertedCategory = await knex('categories')
            .where('category_id', categoryId)
            .select('category_id', 'name', 'active')
            .first();

        ret.addContent('category', insertedCategory);

        ret.setCode(201);
        ret.addMessage('Categoria adicionada com sucesso.');

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
