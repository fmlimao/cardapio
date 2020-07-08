const knex = require('../../database/connection');
const datatableQuery = require('../../validators/datatable-query');

module.exports = async (req, res) => {
    let { draw, start, length, search, validation } = datatableQuery(req);

    if (validation.fails) {
        return res.status(400).json(validation.errors);
    }

    const count = await knex('users')
        .where('deleted_at', null)
        .where('sysadmin', 1)
        .countDistinct('user_id as total')
        .first();

    const countFiltered = await knex('users')
        .where(builder => {
            builder.where('deleted_at', null);
            builder.where('sysadmin', 1);
            if (search.value) {
                builder.where('name', 'like', `%${search.value}%`)
            }
        })
        .countDistinct('user_id as total')
        .first();

    const recordsTotal = count.total;
    const recordsFiltered = countFiltered.total;

    const data = await knex('users')
        .where(builder => {
            builder.where('deleted_at', null);
            builder.where('sysadmin', 1);
            if (search.value) {
                builder.where('name', 'like', `%${search.value}%`);
            }
        })
        .offset(start)
        .limit(length)
        .select('user_id', 'name', 'email', 'sysadmin', 'admin', 'active');

    const ret = {
        draw,
        recordsTotal,
        recordsFiltered,
        data,
    };

    return res.status(200).json(ret);
};
