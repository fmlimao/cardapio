module.exports = {

    up: function (knex) {
        return knex.schema.createTable('categories', table => {
            table.increments('category_id').primary();

            table.integer('tenant_id').notNullable();

            table.string('name').notNullable();

            table.integer('active').notNullable().defaultTo(1);
            table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deletedAt');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('categories');
    },

};
