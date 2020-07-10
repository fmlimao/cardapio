const knex = require('../../../database/connection');
const datatableQuery = require('../../../validators/datatable-query');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        let { draw, start, length, search, validation } = datatableQuery(req);

        if (validation.fails) {
            return res.status(400).json(validation.errors);
        }

        const count = await knex('users')
            .where('deleted_at', null)
            .where('sysadmin', 0)
            .where('tenant_id', req.tenant.tenant_id)
            .countDistinct('user_id as total')
            .first();

        const countFiltered = await knex('users')
            .where(builder => {
                builder.where('deleted_at', null);
                builder.where('sysadmin', 0);
                builder.where('tenant_id', req.tenant.tenant_id);
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
                builder.where('users.deleted_at', null);
                builder.where('users.sysadmin', 0);
                builder.where('tenant_id', req.tenant.tenant_id);
                if (search.value) {
                    builder.where('users.name', 'like', `%${search.value}%`);
                }
            })
            .offset(start)
            .limit(length)
            .select('users.user_id', 'users.name', 'users.email', 'users.admin', 'users.active');

        ret = {
            draw,
            recordsTotal,
            recordsFiltered,
            data,
        };

        return res.status(200).json(ret);
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
