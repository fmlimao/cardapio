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
            name: 'required|string|min:3',
            email: 'required|string|email',
            password: 'required|string|min:6',
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
            .where('deletedAt', null)
            .where('email', email)
            .first();

        if (usersExists) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            ret.setFieldError('email', true, 'Já existe um usuário cadastrado com esse e-mail.');
            throw new Error();
        }

        const saltLength = Number(process.env.AUTH_SALT_LENGTH);
        const salt = bcrypt.genSaltSync(saltLength);
        password = bcrypt.hashSync(password, salt);

        const user_id = await knex('users')
            .returning('user_id')
            .insert({
                name: name,
                email: email,
                password: password,
                salt: salt,
                request_password_change: 0,
                sysadmin: 1,
                admin: 1,
                canDelete: 0,
            });

        const insertedUser = await knex('users')
            .where('user_id', user_id)
            .select('user_id', 'name', 'email')
            .first();

        ret.addContent('user', insertedUser);

        ret.setCode(201);
        ret.addMessage('Usuário adicionado com sucesso.');

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
