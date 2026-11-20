export const AUTHORS = [
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

export const CATEGORIES = [
  'Romance',
  'Clássico',
  'Drama',
  'Ficção Científica',
  'Fantasia',
  'Terror',
  'Aventura',
];

export const BOOKS = [
  { title: 'O Primo Basílio', authorId: 1, year: 1878, categoryId: 1 },
  { title: 'Dom Casmurro', authorId: 2, year: 1899, categoryId: 2 },
  { title: 'Grande Sertão: Veredas', authorId: 3, year: 1956, categoryId: 2 },
  { title: 'Memórias Póstumas de Brás Cubas', authorId: 2, year: 1881, categoryId: 2 },
  { title: 'Capitães da Areia', authorId: 4, year: 1937, categoryId: 3 },
  { title: 'Vidas Secas', authorId: 5, year: 1938, categoryId: 3 },
  { title: '1984', authorId: 6, year: 1949, categoryId: 4 },
  { title: 'Dom Quixote', authorId: 7, year: 1605, categoryId: 2 },
  { title: 'Orgulho e Preconceito', authorId: 8, year: 1813, categoryId: 1 },
  { title: 'Cem Anos de Solidão', authorId: 9, year: 1967, categoryId: 5 },
  { title: 'O Pequeno Príncipe', authorId: 10, year: 1943, categoryId: 5 },
  { title: 'Crime e Castigo', authorId: 11, year: 1866, categoryId: 2 },
  { title: 'O Apanhador no Campo de Centeio', authorId: 12, year: 1951, categoryId: 3 },
  { title: 'O Grande Gatsby', authorId: 13, year: 1925, categoryId: 1 },
  { title: 'A Metamorfose', authorId: 14, year: 1915, categoryId: 3 },
  { title: 'Os Maias', authorId: 1, year: 1888, categoryId: 2 },
  { title: 'O Crime do Padre Amaro', authorId: 1, year: 1875, categoryId: 1 },
  { title: 'Quincas Borba', authorId: 2, year: 1891, categoryId: 2 },
  { title: 'Helena', authorId: 2, year: 1876, categoryId: 1 },
  { title: 'Sagarana', authorId: 3, year: 1946, categoryId: 3 },
  { title: 'Gabriela, Cravo e Canela', authorId: 4, year: 1958, categoryId: 1 },
  { title: 'Dona Flor e Seus Dois Maridos', authorId: 4, year: 1966, categoryId: 1 },
  { title: 'São Bernardo', authorId: 5, year: 1934, categoryId: 3 },
  { title: 'Angústia', authorId: 5, year: 1936, categoryId: 3 },
  { title: 'A Revolução dos Bichos', authorId: 6, year: 1945, categoryId: 4 },
  { title: 'Razão e Sensibilidade', authorId: 8, year: 1811, categoryId: 1 },
  { title: 'Emma', authorId: 8, year: 1815, categoryId: 1 },
  { title: 'O Amor nos Tempos do Cólera', authorId: 9, year: 1985, categoryId: 1 },
  { title: 'Os Irmãos Karamázov', authorId: 11, year: 1880, categoryId: 2 },
  { title: 'O Idiota', authorId: 11, year: 1869, categoryId: 2 },
  { title: 'Noites Brancas', authorId: 11, year: 1848, categoryId: 1 },
  { title: 'O Jogador', authorId: 11, year: 1866, categoryId: 3 },
  { title: 'O Duplo', authorId: 11, year: 1846, categoryId: 3 },
  { title: 'Humilhados e Ofendidos', authorId: 11, year: 1861, categoryId: 3 },
  { title: 'Suave é a Noite', authorId: 13, year: 1934, categoryId: 3 },
  { title: 'O Processo', authorId: 14, year: 1925, categoryId: 3 },
  { title: 'O Castelo', authorId: 14, year: 1926, categoryId: 3 },
  { title: 'Guerra e Paz', authorId: 15, year: 1869, categoryId: 2 },
  { title: 'Anna Karenina', authorId: 15, year: 1877, categoryId: 1 },
  { title: 'A Morte de Ivan Ilitch', authorId: 15, year: 1886, categoryId: 3 },
  { title: 'Ressurreição', authorId: 15, year: 1899, categoryId: 3 },
];

export const USERS = [
  { name: 'Admin', email: 'admin@biblioteca.com', password: 'admin123', role: 'admin' },
  { name: 'João Silva', email: 'joao@email.com', password: 'senha123', role: 'user' },
  { name: 'Maria Souza', email: 'maria@email.com', password: 'senha123', role: 'user' },
  { name: 'Carlos Pereira', email: 'carlos@email.com', password: 'senha123', role: 'user' },
];

// Cada livro recebe de 1 a 4 cópias, todas AVAILABLE.
const COPIES_PER_BOOK = {
  1: 4, 2: 3, 3: 3, 4: 3, 5: 2,
  6: 2, 7: 2, 8: 2, 9: 2, 10: 2,
  11: 2, 12: 2, 13: 2, 14: 2, 15: 2,
  16: 2, 17: 1, 18: 1, 19: 1, 20: 1,
  21: 1, 22: 1, 23: 1, 24: 1, 25: 1,
  26: 1, 27: 1, 28: 1, 29: 1, 30: 1,
  31: 1, 32: 1, 33: 1, 34: 1, 35: 1,
  36: 1, 37: 1,
};

export const COPIES = [];

let codeNumber = 1;

for (let bookId = 1; bookId <= BOOKS.length; bookId++) {
  const count = COPIES_PER_BOOK[bookId] || 1;

  for (let index = 0; index < count; index++) {
    COPIES.push({
      code: `BC-${String(codeNumber).padStart(3, '0')}`,
      bookId,
      status: 'AVAILABLE',
    });
    codeNumber++;
  }
}
