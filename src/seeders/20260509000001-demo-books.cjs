module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Books', [
      {
        title: 'O Primo Basílio',
        author: 'José Maria de Eça de Queirós',
        year: 1878,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        year: 1899,
        available: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Grande Sertão: Veredas',
        author: 'João Guimarães Rosa',
        year: 1956,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Books', null, {});
  },
};
