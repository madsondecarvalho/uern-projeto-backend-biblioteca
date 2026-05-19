module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('Books', 'available');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Books', 'available', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
};
