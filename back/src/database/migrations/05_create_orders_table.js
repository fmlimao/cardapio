module.exports = {

    up: function (knex) {
        return knex.schema.createTable('orders', table => {
            table.increments('order_id').primary();

            table.integer('tenant_id').notNullable();

            table.string('comments');
            table.decimal('final_value').notNullable();

            table.string('client_name').notNullable();
            table.string('client_phone').notNullable();
            table.string('client_cep').notNullable();
            table.string('client_address').notNullable();
            table.string('client_number').notNullable();
            table.string('client_complement');
            table.string('client_neighborhood').notNullable();
            table.string('client_city').notNullable();
            table.string('client_state').notNullable();
            table.string('client_reference');

            table.decimal('payment_type').notNullable();
            table.decimal('payment_diff').notNullable();
            table.decimal('payment_value').notNullable();

            table.dateTime('started_at');
            table.dateTime('sent_at');
            table.dateTime('delivered_at');
            table.dateTime('canceled_at');

            table.integer('active').notNullable().defaultTo(1);
            table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deleted_at');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('orders');
    },

};
