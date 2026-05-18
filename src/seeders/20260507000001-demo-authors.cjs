const AUTHORS = [
  'José Maria de Eça de Queirós',
  'Machado de Assis',
  'João Guimarães Rosa',
  'Jorge Amado',
  'Graciliano Ramos',
  'George Orwell',
  'Miguel de Cervantes',
  'Jane Austen',
  'Gabriel García Márquez',
  'Antoine de Saint-Exupéry',
  'Fiódor Dostoiévski',
  'J.D. Salinger',
  'F. Scott Fitzgerald',
  'Franz Kafka',
  'Liev Tolstói',
];

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Authors',
      AUTHORS.map((name) => ({
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Authors', null, {});
    await queryInterface.sequelize.query('ALTER TABLE Authors AUTO_INCREMENT = 1');
  },
};
