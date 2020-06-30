const Validator = require('validatorjs');
const messagesValidator = require('../../../validators/messages');
const knex = require('../../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields(['enable']);

    try {
        let { enable } = req.body;

        if (typeof enable === 'undefined') enable = '';

        enable = String(enable).trim();

        const data = {
            enable,
        };

        const datatableValidation = new Validator(data, {
            enable: 'required|integer|min:0|max:1',
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

        await knex('users')
            .where('user_id', req.user.user_id)
            .update({
                active: Number(enable),
            });

        const updatedUser = await knex('users')
            .where('user_id', req.user.user_id)
            .select('user_id', 'name', 'email', 'admin', 'active')
            .first();

        ret.addContent('user', updatedUser);

        ret.setCode(200);
        ret.addMessage('Usuário editado com sucesso.');

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
