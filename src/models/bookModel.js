import Book from './book.js';

export const listBooks = async () => Book.findAll();

export const findBook = async (id) => Book.findByPk(id);

export const addBook = async (payload) => Book.create(payload);

export const updateBook = async (id, updates) => {
  const [affected] = await Book.update(updates, { where: { id } });

  if (affected === 0) return null;

  return Book.findByPk(id);
};

export const removeBook = async (id) => {
  const deleted = await Book.destroy({ where: { id } });

  return deleted > 0;
};
