const knex = require('../../../database/connection');
const datatableQuery = require('../../../validators/datatable-query');

module.exports = async (req, res) => {
    let { draw, start, length, search, validation } = datatableQuery(req);

    if (validation.fails) {
        return res.status(400).json(validation.errors);
    }

    const count = await knex('categories')
        .where('deletedAt', null)
        .where('tenant_id', req.tenant.tenant_id)
        .countDistinct('category_id as total')
        .first();

    const countFiltered = await knex('categories')
        .where(builder => {
            builder.where('deletedAt', null);
            builder.where('tenant_id', req.tenant.tenant_id);
            if (search.value) {
                builder.where('name', 'like', `%${search.value}%`)
            }
        })
        .countDistinct('category_id as total')
        .first();

    const recordsTotal = count.total;
    const recordsFiltered = countFiltered.total;

    const data = await knex('categories')
        .where(builder => {
            builder.where('deletedAt', null);
            builder.where('tenant_id', req.tenant.tenant_id);
            if (search.value) {
                builder.where('name', 'like', `%${search.value}%`);
            }
        })
        .offset(start)
        .limit(length)
        .select('category_id', 'name', 'active');

    const ret = {
        draw,
        recordsTotal,
        recordsFiltered,
        data,
    };

    return res.status(200).json(ret);
};
