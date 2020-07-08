module.exports = {

    seed: async function (knex) {

        await knex('tenants').insert([
            {
                name: 'Modelo',
                slug: 'modelo',
                active: 1,
            },
        ]);

        await knex('users').insert([
            {
                name: 'Leandro Sysadmin',
                email: 'fmlimao@gmail.com',
                password: '$2b$10$Vl/VPcAGUwW0JzW4p3r5cegLmnrHaLiaCspb1r8408iAgXA3vAewW',
                salt: '$2b$10$Vl/VPcAGUwW0JzW4p3r5ce',
                request_password_change: 1,
                sysadmin: 1,
                admin: 0,
                canDelete: 0,
            },
            {
                tenant_id: 1,
                name: 'Usuário Admin 1',
                email: 'usu.admin.1@email.com',
                password: '$2b$10$Vl/VPcAGUwW0JzW4p3r5cegLmnrHaLiaCspb1r8408iAgXA3vAewW',
                salt: '$2b$10$Vl/VPcAGUwW0JzW4p3r5ce',
                request_password_change: 1,
                sysadmin: 0,
                admin: 1,
                canDelete: 0,
            },
            {
                tenant_id: 1,
                name: 'Usuário Admin 2',
                email: 'usu.admin.2@email.com',
                password: '$2b$10$Vl/VPcAGUwW0JzW4p3r5cegLmnrHaLiaCspb1r8408iAgXA3vAewW',
                salt: '$2b$10$Vl/VPcAGUwW0JzW4p3r5ce',
                request_password_change: 1,
                sysadmin: 0,
                admin: 1,
                canDelete: 1,
            },
            {
                tenant_id: 1,
                name: 'Usuário Simples 1',
                email: 'usu.simples.1@email.com',
                password: '$2b$10$Vl/VPcAGUwW0JzW4p3r5cegLmnrHaLiaCspb1r8408iAgXA3vAewW',
                salt: '$2b$10$Vl/VPcAGUwW0JzW4p3r5ce',
                request_password_change: 1,
                sysadmin: 0,
                admin: 0,
                canDelete: 0,
            },
            {
                tenant_id: 1,
                name: 'Usuário Simples 2',
                email: 'usu.simples.2@email.com',
                password: '$2b$10$Vl/VPcAGUwW0JzW4p3r5cegLmnrHaLiaCspb1r8408iAgXA3vAewW',
                salt: '$2b$10$Vl/VPcAGUwW0JzW4p3r5ce',
                request_password_change: 1,
                sysadmin: 0,
                admin: 0,
                canDelete: 1,
            },
        ]);

        await knex('categories').insert([
            {
                tenant_id: 1,
                name: 'Lanches',
            },
            {
                tenant_id: 1,
                name: 'Bebidas',
            },
        ]);

        await knex('products').insert([
            {
                tenant_id: 1,
                category_id: 1,
                name: 'X Salada',
                description: 'Pão, hamburguer, queijo e salada',
                price: 9.95,
            },
            {
                tenant_id: 1,
                category_id: 1,
                name: 'X Egg',
                description: 'Pão, ovo e queijo',
                price: 8.45,
            },
            {
                tenant_id: 1,
                category_id: 1,
                name: 'X Tudo',
                description: 'Pão, hamburguer, queijo, ovo, bacon e salada',
                price: 16.00,
            },
            {
                tenant_id: 1,
                category_id: 2,
                name: 'Coca Cola 2L',
                price: 12,
            },
            {
                tenant_id: 1,
                category_id: 2,
                name: 'Coca Cola 600ml',
                price: 6,
            },
            {
                tenant_id: 1,
                category_id: 2,
                name: 'Soda 600ml',
                price: 6,
            },
        ]);

        await knex('business_hours').insert([
            {
                tenant_id: 1,
                weekday: 0,
                closed: 1,
            },
            {
                tenant_id: 1,
                weekday: 1,
                closed: 1,
            },
            {
                tenant_id: 1,
                weekday: 2,
                closed: 1,
            },
            {
                tenant_id: 1,
                weekday: 3,
                closed: 1,
            },
            {
                tenant_id: 1,
                weekday: 4,
                closed: 0,
                start_time: '18:00',
                end_time: '00:00',
            },
            {
                tenant_id: 1,
                weekday: 5,
                closed: 0,
                start_time: '17:00',
                end_time: '00:00',
            },
            {
                tenant_id: 1,
                weekday: 6,
                closed: 0,
                start_time: '17:00',
                end_time: '23:00',
            },
        ]);

    },

};
