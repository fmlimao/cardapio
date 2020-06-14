require("dotenv-safe").config();
const knex = require('../../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JsonReturn = require('../../helpers/json-return');

module.exports = async (req, res) => {
    const ret = new JsonReturn();
    ret.addFields(['email', 'password']);

    try {
        const { email, password } = req.body;

        let error = false;

        if (!email) {
            error = true;
            ret.setFieldError('email', true, 'Campo obrigatório.');
        }

        if (!password) {
            error = true;
            ret.setFieldError('password', true, 'Campo obrigatório.');
        }

        if (error) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        const user = await knex('users')
            .where('deletedAt', null)
            .where('active', 1)
            .where('email', email)
            .first();

        if (!user) {
            ret.setCode(400);
            ret.addMessage('Usuário não encontrado.');
            throw new Error();
        }

        const passwordVerify = bcrypt.compareSync(password, user.password);

        if (!passwordVerify) {
            ret.setCode(400);
            ret.addMessage('Usuário não encontrado.');
            throw new Error();
        }

        if (user.request_password_change) {
            const saltLength = Number(process.env.AUTH_SALT_LENGTH);
            const newSalt = bcrypt.genSaltSync(saltLength);
            const newPasswordResetHash = Buffer.from(user.email + newSalt).toString('base64');

            await knex('users')
                .where('user_id', user.user_id)
                .update({
                    'password_reset_hash': newPasswordResetHash,
                    'password_reset_date': knex.fn.now(),
                });

            ret.setCode(400);
            ret.addMessage('Foi solicitada uma troca imediata da senha.');
            ret.addContent('resetPasswordUrl', {
                method: 'get',
                url: `${process.env.APP_HOST}/auth/reset-password/${newPasswordResetHash}`,
            });

            throw new Error();
        }

        const exp = Number(process.env.TOKEN_EXPIRATION_SEC);
        const login = {
            id: user.user_id,
        };
        if (exp) {
            login.exp = Math.floor(Date.now() / 1000) + Number(process.env.TOKEN_EXPIRATION_SEC);
        }

        const token = jwt.sign(login, process.env.TOKEN_SECRET);
        ret.addContent('token', token);

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
