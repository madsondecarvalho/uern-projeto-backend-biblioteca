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
    await queryInterface.sequelize.query("ALTER SEQUENCE \"Categories_id_seq\" RESTART WITH 1");
  },
};
