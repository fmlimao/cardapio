module.exports = {

    up: function (knex) {
        return knex.schema.createTable('order_products', table => {
            table.increments('order_product_id').primary();

            table.integer('order_id').notNullable();
            table.integer('product_id').notNullable();
            table.integer('category_id').notNullable();

            table.string('name').notNullable();
            table.string('description');
            table.decimal('price').notNullable();
            table.decimal('amount').notNullable();
            table.decimal('final_value').notNullable();

            table.integer('active').notNullable().defaultTo(1);
            table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deleted_at');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('order_products');
    },

};
