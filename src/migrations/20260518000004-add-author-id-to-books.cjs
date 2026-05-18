module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Books', 'authorId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'Authors',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.removeColumn('Books', 'author');
  },

  down: async (queryInterface) => {
    await queryInterface.addColumn('Books', 'author', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: '',
    });

    await queryInterface.removeColumn('Books', 'authorId');
  },
};
