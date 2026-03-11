const books = [
  {
    id: 1,
    title: 'O Primo Basílio',
    author: 'José Maria de Eça de Queirós',
    year: 1878,
    available: true
  },
  {
    id: 2,
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    year: 1899,
    available: false
  },
  {
    id: 3,
    title: 'Grande Sertão: Veredas',
    author: 'João Guimarães Rosa',
    year: 1956,
    available: true
  }
];

export const listBooks = () => books;

export const findBook = (id) => books.find((book) => book.id === id);

export const addBook = (payload) => {
  const newBook = {
    id: Number(globalThis.crypto.randomUUID()?.split('-')[0] ?? books.length + 1),
    ...payload
  };

  books.push(newBook);
  return newBook;
};

export const updateBook = (id, updates) => {
  const index = books.findIndex((book) => book.id === id);

  if (index === -1) return null;

  const updated = { ...books[index], ...updates };
  books[index] = updated;

  return updated;
};

export const removeBook = (id) => {
  const index = books.findIndex((book) => book.id === id);

  if (index === -1) return false;

  books.splice(index, 1);
  return true;
};
