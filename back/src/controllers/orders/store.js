const Validator = require('validatorjs');
const messagesValidator = require('../../validators/messages');
const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields([
        'client.name',
        'client.phone',
        'client.cep',
        'client.address',
        'client.number',
        'client.complement',
        'client.neighborhood',
        'client.city',
        'client.state',
        'client.reference',
        'payment.type',
        'payment.diff',
        'payment.value',
        'comments',
        'items',
    ]);

    const itemsValidator = {
        'client.name': 'required|string|min:3',
        'client.phone': 'required|string|min:3',
        'client.cep': 'required|string|min:8',
        'client.address': 'required|string|min:3',
        'client.number': 'required|string|min:1',
        'client.complement': 'string',
        'client.neighborhood': 'required|string|min:3',
        'client.city': 'required|string|min:3',
        'client.state': 'required|string|min:2',
        'client.reference': 'string',

        'payment.type': 'required|numeric|between:1,2',
        'payment.diff': 'required|numeric|between:0,1',
        'payment.value': 'required|numeric|min:0',

        'comments': 'string',

        'items': 'required|array',
    };

    try {
        let { client, payment, comments, items } = req.body;

        if (typeof client !== 'object') client = {};
        if (typeof client.name == 'undefined') client.name = '';
        if (typeof client.phone == 'undefined') client.phone = '';
        if (typeof client.cep == 'undefined') client.cep = '';
        if (typeof client.address == 'undefined') client.address = '';
        if (typeof client.number == 'undefined') client.number = '';
        if (typeof client.complement == 'undefined') client.complement = '';
        if (typeof client.neighborhood == 'undefined') client.neighborhood = '';
        if (typeof client.city == 'undefined') client.city = '';
        if (typeof client.state == 'undefined') client.state = '';
        if (typeof client.reference == 'undefined') client.reference = '';

        if (typeof payment !== 'object') payment = {};
        if (typeof payment.type != 'number') payment.type = '';
        if (typeof payment.diff != 'number') payment.diff = '';
        if (typeof payment.value != 'number') payment.value = '';

        if (typeof comments === 'undefined') comments = '';

        if (typeof items !== 'object') items = [];
        for (let i in items) {
            if (typeof items[i].id !== 'number') items[i].id = '';
            if (typeof items[i].amount !== 'number') items[i].amount = '';
            ret.addFields([`items.${i}.id`, `items.${i}.amount`]);
            itemsValidator['items.*.id'] = 'required|numeric|min:1';
            itemsValidator['items.*.amount'] = 'required|numeric|min:1';
        }

        client.name = String(client.name).trim();
        client.phone = String(client.phone).trim();
        client.cep = String(client.cep).trim();
        client.address = String(client.address).trim();
        client.number = String(client.number).trim();
        client.complement = String(client.complement).trim();
        client.neighborhood = String(client.neighborhood).trim();
        client.city = String(client.city).trim();
        client.state = String(client.state).trim();
        client.reference = String(client.reference).trim();

        payment.type = Number(payment.type);
        payment.diff = Number(payment.diff);
        payment.value = Number(payment.value);

        comments = String(comments).trim();

        const data = {
            client,
            payment,
            comments,
            items,
        };

        const datatableValidation = new Validator(data, itemsValidator, messagesValidator);
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

        let error = false;

        if (payment.type == 2 && payment.diff == 1 && payment.value <= 0) {
            error = true;
            ret.setFieldError('payment.value', true, 'Campo obrigatório.');
        }

        for (let i in items) {
            if (typeof items[i].id !== 'number') items[i].id = '';

            let productExists = await knex('products')
                .where('deleted_at', null)
                .where('product_id', items[i].id)
                .where('tenant_id', req.tenant.tenant_id)
                .first();

            if (!productExists) {
                error = true;
                ret.setFieldError(`items.${i}.id`, true, 'Produto não encontrado.');
            }
        }

        if (error) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }





        // const tenantExists = await knex('tenants')
        //     .where('deleted_at', null)
        //     .where('name', name)
        //     .first();

        // if (tenantExists) {
        //     ret.setCode(400);
        //     ret.addMessage('Verifique todos os campos.');
        //     ret.setFieldError('name', true, 'Já existe um inquilino cadastrado com esse nome.');
        //     throw new Error();
        // }

        // const slugName = slug(name);

        // const tenant_id = await knex('tenants')
        //     .returning('tenant_id')
        //     .insert({
        //         name,
        //         slug: slugName,
        //         active: 0,
        //     });

        // const insertedTenant = await knex('tenants')
        //     .where('tenant_id', tenant_id)
        //     .select('tenant_id', 'name', 'slug', 'active')
        //     .first();

        // ret.addContent('tenant', insertedTenant);

        // ret.setCode(201);
        // ret.addMessage('Inquilino adicionado com sucesso.');

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
