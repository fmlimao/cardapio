module.exports = {

    up: function (knex) {
        return knex.schema.createTable('tenants', table => {
            table.increments('tenant_id').primary();

            table.string('name').notNullable();
            table.string('slug').notNullable();

            table.integer('active').notNullable().defaultTo(1);
            table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deleted_at');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('tenants');
    },

};
