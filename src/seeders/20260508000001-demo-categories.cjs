const CATEGORIES = [
  { name: 'Romance' },
  { name: 'Clássico' },
  { name: 'Drama' },
  { name: 'Ficção Científica' },
  { name: 'Fantasia' },
  { name: 'Terror' },
  { name: 'Aventura' },
];

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Categories',
      CATEGORIES.map((cat) => ({
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.sequelize.query('ALTER TABLE Categories AUTO_INCREMENT = 1');
  },
};
