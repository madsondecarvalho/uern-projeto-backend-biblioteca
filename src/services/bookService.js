import * as bookModel from '../models/bookModel.js';

export class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

const validateBookPayload = ({ title, author, year }) => {
  if (!title || !author || typeof year !== 'number') {
    throw new ServiceError('Título, autor e ano são obrigatórios', 400);
  }
};

export const listBooks = () => bookModel.listBooks();

export const getBookById = (id) => {
  const book = bookModel.findBook(id);

  if (!book) {
    throw new ServiceError('Livro não encontrado', 404);
  }

  return book;
};

export const createBook = (payload) => {
  validateBookPayload(payload);

  return bookModel.addBook({
    ...payload,
    available: Boolean(payload.available)
  });
};

export const replaceBook = (id, payload) => {
  validateBookPayload(payload);

  const updatedBook = bookModel.updateBook(id, {
    ...payload,
    available: Boolean(payload.available)
  });

  if (!updatedBook) {
    throw new ServiceError('Livro não encontrado', 404);
  }

  return updatedBook;
};

export const deleteBook = (id) => {
  const removed = bookModel.removeBook(id);

  if (!removed) {
    throw new ServiceError('Livro não encontrado', 404);
  }
};
