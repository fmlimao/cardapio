const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;

    try {
        let { userId } = req.params;

        const user = await knex('users')
            .where('deletedAt', null)
            .where('sysadmin', 1)
            .where('user_id', userId)
            .select('user_id', 'name', 'email')
            .first();

        if (!user) {
            ret.setCode(404);
            ret.addMessage('Usuário não encontrado.');
            throw new Error();
        }

        ret.addContent('user', user);

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
