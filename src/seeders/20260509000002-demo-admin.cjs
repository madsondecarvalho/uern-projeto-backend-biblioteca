const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const hashed = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin',
        email: 'admin@biblioteca.com',
        password: hashed,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { ignoreDuplicates: true });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
