const knex = require('../../database/connection');

module.exports = async (req, res) => {
    const ret = req.ret;

    try {
        delete req.tenant.tenant_id;
        ret.addContent('tenant', req.tenant);

        if (req.opened) ret.addContent('opened', req.opened)
        if (req.business_hours) ret.addContent('business_hours', req.business_hours)

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
