module.exports = {

    up: function (knex) {
        return knex.schema.createTable('products', table => {
            table.increments('product_id').primary();

            table.integer('tenant_id').notNullable();
            table.integer('category_id').notNullable();

            table.string('name').notNullable();
            table.string('description').notNullable();
            table.string('price').notNullable();

            table.integer('active').notNullable().defaultTo(1);
            table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deletedAt');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('products');
    },

};
