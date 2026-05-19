const bcrypt = require('bcrypt');

const USERS = [
  { name: 'Admin', email: 'admin@biblioteca.com', password: 'admin123', role: 'admin' },
  { name: 'João Silva', email: 'joao@email.com', password: 'senha123', role: 'user' },
  { name: 'Maria Souza', email: 'maria@email.com', password: 'senha123', role: 'user' },
  { name: 'Carlos Pereira', email: 'carlos@email.com', password: 'senha123', role: 'user' },
];

module.exports = {
  up: async (queryInterface) => {
    const hashed = await Promise.all(
      USERS.map((u) => bcrypt.hash(u.password, 10)),
    );

    await queryInterface.bulkInsert('Users',
      USERS.map((u, i) => ({
        name: u.name,
        email: u.email,
        password: hashed[i],
        role: u.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      { ignoreDuplicates: true },
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.sequelize.query("ALTER SEQUENCE \"Users_id_seq\" RESTART WITH 1");
  },
};
