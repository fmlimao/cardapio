module.exports = {

    seed: async function (knex) {
        await knex('users').insert([
            {
                name: 'Leandro',
                email: 'fmlimao@gmail.com',
                password: '$2b$10$Vl/VPcAGUwW0JzW4p3r5cegLmnrHaLiaCspb1r8408iAgXA3vAewW',
                salt: '$2b$10$Vl/VPcAGUwW0JzW4p3r5ce',
                request_password_change: 1,
                admin: 1,
                canDelete: 0,
            },
        ]);
    },

};
