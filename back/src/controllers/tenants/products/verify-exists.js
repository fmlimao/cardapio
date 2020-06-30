const knex = require('../../../database/connection');

module.exports = async (req, res, next) => {
    const ret = req.ret;

    try {
        let { productId } = req.params;

        const product = await knex('products')
            .where('deletedAt', null)
            .where('tenant_id', req.tenant.tenant_id)
            .where('category_id', req.category.category_id)
            .where('product_id', productId)
            .select('product_id', 'name', 'description', 'price', 'active')
            .first();

        if (!product) {
            ret.setCode(404);
            ret.addMessage('Produto não encontrado.');
            throw new Error();
        }

        req.product = product;
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
