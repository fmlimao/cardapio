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

    const trx = await knex.transaction();

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

        let final_value = 0;
        const productsData = [];
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
            } else {
                let price = Number(productExists.price.toFixed(2));
                let amount = Number(items[i].amount.toFixed(2));
                let value = Number(Number(price * amount).toFixed(2));
                final_value = Number((final_value + value).toFixed(2));

                productsData.push({
                    product_id: productExists.product_id,
                    category_id: productExists.category_id,

                    name: productExists.name,
                    description: productExists.description,
                    price: productExists.price,
                    amount: amount,
                    final_value: value,
                });
            }
        }

        if (error) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        if (payment.type == 2 && payment.diff == 1 && payment.value < final_value) {
            error = true;
            ret.setFieldError('payment.value', true, 'Valor menor do que o valor do pedido.');
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        const orderData = {
            tenant_id: req.tenant.tenant_id,

            comments: comments,
            final_value: final_value,

            client_name: client.name,
            client_phone: client.phone,
            client_cep: client.cep,
            client_address: client.address,
            client_number: client.number,
            client_complement: client.complement,
            client_neighborhood: client.neighborhood,
            client_city: client.city,
            client_state: client.state,
            client_reference: client.reference,

            payment_type: payment.type,
            payment_diff: payment.diff,
            payment_value: payment.value,
        };

        const orderId = (
            await trx('orders')
                .insert(orderData)
        )[0];

        for (let i in productsData) {
            productsData[i].order_id = orderId;
        }

        await trx('order_products')
            .insert(productsData)

        await trx.commit();

        ret.addContent('order', orderId);

        ret.setCode(201);
        ret.addMessage('Pedido adicionado com sucesso.');

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret.setError(true);

        if (ret.getCode() === 200) {
            ret.setCode(500);
        }

        if (err.message) {
            ret.addMessage(err.message);
        }

        await trx.rollback();

        return res.status(ret.getCode()).json(ret.generate());
    }
};
