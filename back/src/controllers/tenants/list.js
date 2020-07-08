const knex = require('../../database/connection');
const datatableQuery = require('../../validators/datatable-query');

module.exports = async (req, res) => {
    let { draw, start, length, search, validation } = datatableQuery(req);

    if (validation.fails) {
        return res.status(400).json(validation.errors);
    }

    const count = await knex('tenants')
        .where('deleted_at', null)
        .countDistinct('tenant_id as total')
        .first();

    const countFiltered = await knex('tenants')
        .where(builder => {
            builder.where('deleted_at', null);
            if (search.value) {
                builder.where('name', 'like', `%${search.value}%`)
            }
        })
        .countDistinct('tenant_id as total')
        .first();

    const recordsTotal = count.total;
    const recordsFiltered = countFiltered.total;

    const data = await knex('tenants')
        .where(builder => {
            builder.where('deleted_at', null);
            if (search.value) {
                builder.where('name', 'like', `%${search.value}%`)
            }
        })
        .offset(start)
        .limit(length)
        .select('tenant_id', 'name', 'slug', 'active');

    const ret = {
        draw,
        recordsTotal,
        recordsFiltered,
        data,
    };

    return res.status(200).json(ret);
};
