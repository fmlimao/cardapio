const knex = require('../../database/connection');

module.exports = async (req, res) => {
    let { draw, start, length, search } = req.query;

    draw = draw || 1;
    start = start || 0;
    length = length || 5;

    const count = await knex('tenants')
        .where('deletedAt', null)
        .countDistinct('tenant_id as total')
        .first();

    const recordsTotal = count.total;
    const recordsFiltered = count.total;

    const data = await knex('tenants')
        .where('deletedAt', null)
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
