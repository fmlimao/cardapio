module.exports = {

    up: function (knex) {
        return knex.schema.createTable('tenants', table => {
            table.increments('tenant_id').primary();

            table.string('name').notNullable();
            table.string('slug').notNullable();

            table.integer('active').notNullable().defaultTo(1);
            table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deletedAt');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('tenants');
    },

};
