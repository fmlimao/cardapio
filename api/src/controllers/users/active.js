const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;
    ret.addFields(['active']);

    try {
        const currentUser = await knex('users')
            .where('deleted_at', null)
            .where('user_id', req.user.user_id)
            .first();

        if (!currentUser) {
            ret.setCode(404);
            ret.addMessage('Usuário não encontrado.');
            throw new Error();
        }

        if (currentUser.user_id == 1) {
            ret.setCode(400);
            ret.addMessage('Este usuário não pode ser editado.');
            throw new Error();
        }

        let { active } = req.body;
        let error = false;

        if (typeof active == 'undefined') {
            error = true;
            ret.setFieldError('active', true, 'Campo obrigatório.');
        } else {
            active = Number(active);
            if (active !== 0 && active !== 1) {
                error = true;
                ret.setFieldError('active', true, 'Este campo precisa ser "0" ou "1".');
            }
        }

        if (error) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        await knex('users')
            .where('user_id', req.user.user_id)
            .update({
                active: Number(active),
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
