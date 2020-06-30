require("dotenv-safe").config();
const Validator = require('validatorjs');
const messagesValidator = require('../../../validators/messages');
const knex = require('../../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields(['name', 'description', 'price']);

    try {
        let { name, description, price } = req.body;

        if (typeof name === 'undefined') name = '';
        if (typeof description === 'undefined') description = '';
        if (typeof price === 'undefined') price = '';

        name = String(name).trim();
        description = String(description).trim();
        price = Number(price);

        const data = {
            name,
            description,
            price,
        };

        const datatableValidation = new Validator(data, {
            name: 'required|string|min:3',
            description: 'string|min:3',
            price: 'required|numeric|min:0',
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

        const productsExists = await knex('products')
            .where('deletedAt', null)
            .where('tenant_id', req.tenant.tenant_id)
            .where('category_id', req.category.category_id)
            .where('name', name)
            .first();

        if (productsExists) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            ret.setFieldError('name', true, 'Já existe um produto cadastrado com esse nome.');
            throw new Error();
        }

        const productId = (await knex('products')
            .insert({
                tenant_id: req.tenant.tenant_id,
                category_id: req.category.category_id,
                name: name,
                description: description,
                price: price,
            }))[0];

        const insertedProduct = await knex('products')
            .where('product_id', productId)
            .select('product_id', 'name', 'description', 'price', 'active')
            .first();

        ret.addContent('product', insertedProduct);

        ret.setCode(201);
        ret.addMessage('Produto adicionado com sucesso.');

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
