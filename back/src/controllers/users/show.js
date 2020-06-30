const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;

    try {
        ret.addContent('user', req.user);

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
