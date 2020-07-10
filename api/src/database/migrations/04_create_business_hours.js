module.exports = {

    up: function (knex) {
        return knex.schema.createTable('business_hours', table => {
            table.increments('business_hour_id').primary();

            table.integer('tenant_id').notNullable();

            table.integer('weekday').notNullable();
            table.integer('closed').notNullable().defaultTo(1);
            table.string('start_time');
            table.string('end_time');

            table.integer('active').notNullable().defaultTo(1);
            table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deleted_at');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('business_hours');
    },

};
