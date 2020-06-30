const knex = require('../../../database/connection');
const datatableQuery = require('../../../validators/datatable-query');

module.exports = async (req, res) => {
    let { draw, start, length, search, validation } = datatableQuery(req);

    if (validation.fails) {
        return res.status(400).json(validation.errors);
    }

    const count = await knex('products')
        .where('deletedAt', null)
        .where('tenant_id', req.tenant.tenant_id)
        .where('category_id', req.category.category_id)
        .countDistinct('product_id as total')
        .first();

    const countFiltered = await knex('products')
        .where(builder => {
            builder.where('deletedAt', null);
            builder.where('tenant_id', req.tenant.tenant_id);
            builder.where('category_id', req.category.category_id);
            if (search.value) {
                builder.where('name', 'like', `%${search.value}%`)
            }
        })
        .countDistinct('product_id as total')
        .first();

    const recordsTotal = count.total;
    const recordsFiltered = countFiltered.total;

    const data = await knex('products')
        .where(builder => {
            builder.where('deletedAt', null);
            builder.where('tenant_id', req.tenant.tenant_id);
            builder.where('category_id', req.category.category_id);
            if (search.value) {
                builder.where('name', 'like', `%${search.value}%`);
            }
        })
        .offset(start)
        .limit(length)
        .select('product_id', 'name', 'description', 'price', 'active');

    const ret = {
        draw,
        recordsTotal,
        recordsFiltered,
        data,
    };

    return res.status(200).json(ret);
};
