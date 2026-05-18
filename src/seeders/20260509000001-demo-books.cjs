const BOOKS = [
  { title: 'O Primo Basílio', author: 'José Maria de Eça de Queirós', year: 1878, available: true },
  { title: 'Dom Casmurro', author: 'Machado de Assis', year: 1899, available: false },
  { title: 'Grande Sertão: Veredas', author: 'João Guimarães Rosa', year: 1956, available: true },
  { title: 'Memórias Póstumas de Brás Cubas', author: 'Machado de Assis', year: 1881, available: true },
  { title: 'Capitães da Areia', author: 'Jorge Amado', year: 1937, available: true },
  { title: 'Vidas Secas', author: 'Graciliano Ramos', year: 1938, available: true },
  { title: '1984', author: 'George Orwell', year: 1949, available: true },
  { title: 'Dom Quixote', author: 'Miguel de Cervantes', year: 1605, available: false },
  { title: 'Orgulho e Preconceito', author: 'Jane Austen', year: 1813, available: true },
  { title: 'Cem Anos de Solidão', author: 'Gabriel García Márquez', year: 1967, available: true },
  { title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', year: 1943, available: true },
  { title: 'Crime e Castigo', author: 'Fiódor Dostoiévski', year: 1866, available: true },
  { title: 'O Apanhador no Campo de Centeio', author: 'J.D. Salinger', year: 1951, available: true },
  { title: 'O Grande Gatsby', author: 'F. Scott Fitzgerald', year: 1925, available: true },
  { title: 'A Metamorfose', author: 'Franz Kafka', year: 1915, available: true },
];

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Books',
      BOOKS.map((book) => ({
        ...book,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Books', null, {});
  },
};
