module.exports = {

    up: function (knex) {
        return knex.schema.createTable('users', table => {
            table.increments('user_id').primary();

            table.string('name').notNullable();
            table.string('email').notNullable();
            table.string('password').notNullable();
            table.string('salt').notNullable();

            table.string('password_reset_hash');
            table.dateTime('password_reset_date');
            table.integer('request_password_change').defaultTo(0);

            table.integer('master').defaultTo(0);

            table.integer('active').notNullable().defaultTo(1);
            table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deletedAt');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('users');
    },

};
