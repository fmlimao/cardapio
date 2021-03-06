module.exports = {

    up: function (knex) {
        return knex.schema.createTable('users', table => {
            table.increments('user_id').primary();

            table.integer('tenant_id');

            table.string('name').notNullable();
            table.string('email').notNullable();
            table.string('password').notNullable();
            table.string('salt').notNullable();

            table.string('password_reset_hash');
            table.dateTime('password_reset_date');
            table.integer('request_password_change').defaultTo(0);

            table.integer('sysadmin').defaultTo(0);
            table.integer('admin').defaultTo(0);
            table.integer('canDelete').defaultTo(1);

            table.integer('active').notNullable().defaultTo(1);
            table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('deleted_at');
        });
    },

    down: async function (knex) {
        return knex.schema.dropTable('users');
    },

};
