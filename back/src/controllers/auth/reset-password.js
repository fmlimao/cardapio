require("dotenv-safe").config();
const knex = require('../../database/connection');
const moment = require('moment');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields(['password']);

    try {
        const { hash } = req.params;

        const user = await knex('users')
            .where('deleted_at', null)
            .where('active', 1)
            .where('password_reset_hash', hash)
            .first();

        if (!user) {
            ret.setCode(400);
            ret.addMessage('Link inválido.');
            throw new Error();
        }

        var currentDatetime = moment().format();
        var resetDatetime = user.password_reset_date;
        var startDate = moment(resetDatetime, 'YYYY-MM-DD HH:mm:ss');
        var endDate = moment(currentDatetime, 'YYYY-MM-DD HH:mm:ss');
        var duration = moment.duration(endDate.diff(startDate));
        var hours = duration.asHours();

        if (hours > 1) {
            ret.setCode(400);
            ret.addMessage('Link expirado. Por favor, solicite a troca de senha novamente.');
            throw new Error();
        }

        const { password } = req.body;

        let error = false;

        if (!password) {
            error = true;
            ret.setFieldError('password', true, 'Campo obrigatório.');
        } else if (password.length < 6) {
            error = true;
            ret.setFieldError('password', true, 'A senha precisa ter pelo menos 6 caracteres.');
        }

        if (error) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        const saltLength = Number(process.env.AUTH_SALT_LENGTH);
        const newSalt = bcrypt.genSaltSync(saltLength);
        const newPassword = bcrypt.hashSync(password, newSalt);

        await knex('users')
            .where('user_id', user.user_id)
            .update({
                'password': newPassword,
                'salt': newSalt,
                'password_reset_hash': null,
                'password_reset_date': null,
                'request_password_change': 0,
            });


        ret.addMessage('Senha alterada com sucesso.');

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
