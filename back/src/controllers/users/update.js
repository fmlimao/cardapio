require("dotenv-safe").config();
const Validator = require('validatorjs');
const messagesValidator = require('../../validators/messages');
const knex = require('../../database/connection');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields(['name', 'email', 'password']);

    try {
        let { name, email, password } = req.body;

        if (typeof name === 'undefined') name = '';
        if (typeof email === 'undefined') email = '';
        if (typeof password === 'undefined') password = '';

        name = String(name).trim();
        email = String(email).trim();
        password = String(password).trim();

        const data = {
            name,
            email,
            password,
        };

        const datatableValidation = new Validator(data, {
            name: 'string|min:3',
            email: 'string|email',
            password: 'string|min:6',
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

        const usersExists = await knex('users')
            .where('deleted_at', null)
            .where('email', email)
            .where('user_id', '!=', req.user.user_id)
            .first();

        if (usersExists) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            ret.setFieldError('email', true, 'Já existe um usuário cadastrado com esse e-mail.');
            throw new Error();
        }

        let saltLength = '';
        let salt = '';
        if (password) {
            saltLength = Number(process.env.AUTH_SALT_LENGTH);
            salt = bcrypt.genSaltSync(saltLength);
            password = bcrypt.hashSync(password, salt);
        }

        const userChanges = {};
        let hasChange = false;

        if (name) {
            hasChange = true;
            userChanges.name = name;
        }

        if (email) {
            hasChange = true;
            userChanges.email = email;
        }

        if (password) {
            hasChange = true;
            userChanges.password = password;
            userChanges.salt = salt;
        }

        if (!hasChange) {
            ret.setCode(400);
            ret.addMessage('É necessário alterar alguma informação.');
            throw new Error();
        }

        await knex('users')
            .where('user_id', req.user.user_id)
            .update(userChanges);

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
