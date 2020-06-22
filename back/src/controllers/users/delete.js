const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;

    try {
        const { userId } = req.params;

        const currentUser = await knex('users')
            .where('deletedAt', null)
            .where('sysadmin', 1)
            .where('user_id', userId)
            .first();

        if (!currentUser) {
            ret.setCode(404);
            ret.addMessage('Usuário não encontrado.');
            throw new Error();
        }

        if (!currentUser.canDelete) {
            ret.setCode(400);
            ret.addMessage('Este usuário não pode ser removido.');
            throw new Error();
        }

        await knex('users')
            .where('user_id', userId)
            .update({
                deletedAt: knex.fn.now(),
            });

        // ret.setCode(204);
        ret.addMessage('Usuário removido com sucesso.');

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
