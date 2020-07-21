const knex = require('../database/connection');
const axios = require('axios');

module.exports = async (req, res, next) => {
    const ret = req.ret;

    try {
        let { tenantSlug } = req.params;

        const tenant = await knex('tenants')
            .where('deleted_at', null)
            .where('active', 1)
            .where('slug', tenantSlug)
            .select('tenant_id', 'name', 'slug', 'whatsapp')
            .first();

        if (!tenant) {
            ret.setCode(404);
            ret.addMessage('Inquilino não encontrado.');
            throw new Error();
        }

        const opened = (await knex.raw(`
            SELECT business_hour_id
            FROM business_hours
            WHERE deleted_at IS NULL
            AND active = 1
            AND tenant_id = ?
            AND weekday = WEEKDAY(NOW())
            AND closed = 0
            AND NOW() BETWEEN CONCAT(DATE(NOW()), ' ', start_time, ':00') AND IF(
                    start_time < end_time,
                    CONCAT(DATE(NOW()), ' ', end_time, ':00'),
                    CONCAT(DATE(DATE_ADD(NOW(), INTERVAL 1 DAY)), ' ', end_time, ':00')
                );
        `, [tenant.tenant_id]))[0];

        const business_hours = await knex('business_hours')
            .where('deleted_at', null)
            .where('active', 1)
            .where('closed', 0)
            .where('tenant_id', tenant.tenant_id)
            .select('weekday', 'start_time', 'end_time')
            .orderBy('weekday', 'start_time');

        const hours = {};

        for (let i in business_hours) {
            const weekday = business_hours[i].weekday;
            const start_time = business_hours[i].start_time;
            const end_time = business_hours[i].end_time;

            switch (weekday) {
                case 0: weekdayName = 'Segunda Feira'; break;
                case 1: weekdayName = 'Terça Feira'; break;
                case 2: weekdayName = 'Quarta Feira'; break;
                case 3: weekdayName = 'Quinta Feira'; break;
                case 4: weekdayName = 'Sexta Feira'; break;
                case 5: weekdayName = 'Sábado'; break;
                case 6: weekdayName = 'Domingo'; break;
            }

            if (typeof hours[weekday] === 'undefined') {
                hours[weekday] = {
                    name: weekdayName,
                    hours: [],
                };

                hours[weekday].hours.push([start_time, end_time].join(' - '));
            }
        }

        const products = (await knex.raw(`
            SELECT c.category_id
                 , c.name AS category
                 , p.product_id
                 , p.name as product
                 , p.description
                 , p.price
            FROM products p
            INNER JOIN categories c on p.category_id = c.category_id AND c.deleted_at IS NULL AND c.active = 1
            WHERE p.deleted_at IS NULL
                AND p.active = 1
                AND p.tenant_id = ?
            ORDER BY category, product;
        `, [tenant.tenant_id]))[0];

        tenant.opened = !!opened.length;
        tenant.business_hours = Object.values(hours);
        tenant.products = products;
        tenant.order_host = `${process.env.APP_HOST}/site/orders/${tenant.slug}`;

        req.tenant = tenant;
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
