const knex = require('../../../database/connection');

module.exports = async (req, res, next) => {
    const ret = req.ret;

    try {
        let { categoryId } = req.params;

        const category = await knex('categories')
            .where('deletedAt', null)
            .where('tenant_id', req.tenant.tenant_id)
            .where('category_id', categoryId)
            .select('category_id', 'name', 'active')
            .first();

        if (!category) {
            ret.setCode(404);
            ret.addMessage('Categoria não encontrada.');
            throw new Error();
        }

        req.category = category;
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

    next();
};
