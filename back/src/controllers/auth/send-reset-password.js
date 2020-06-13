require("dotenv-safe").config();
const knex = require('../../database/connection');
const bcrypt = require('bcrypt');

const JsonReturn = require('../../helpers/json-return');

module.exports = async (req, res) => {
    const ret = new JsonReturn();
    ret.addFields(['email']);

    try {
        const { email } = req.body;

        let error = false;

        if (!email) {
            error = true;
            ret.setFieldError('email', true, 'Campo obrigatório.');
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

        const saltLength = Number(process.env.AUTH_SALT_LENGTH);
        const newSalt = bcrypt.genSaltSync(saltLength);
        const newPasswordResetHash = Buffer.from(user.email + newSalt).toString('base64');

        await knex('users')
            .where('user_id', user.user_id)
            .update({
                'password_reset_hash': newPasswordResetHash,
                'password_reset_date': knex.fn.now(),
            });

        // todo: Enviar email com link para troca de senha.

        ret.addMessage('Um e-mail foi enviado com o link para troca de senha.');

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
