module.exports = {

    up: function (knex) {
        return knex.schema.createTable('tenant_users', table => {
            table.increments('tenant_user_id').primary();
            table.integer('tenant_id').notNullable();
            table.integer('user_id').notNullable();
            table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deletedAt');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('tenant_users');
    },

};
