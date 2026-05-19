import * as bookModel from '../models/bookModel.js';

export class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export const listBooks = async (filters = {}, pagination = {}) => bookModel.listBooks(filters, pagination);

export const getBookById = async (id) => {
  const book = await bookModel.findBook(id);

  if (!book) {
    throw new ServiceError('Livro não encontrado', 404);
  }

  return book;
};

export const createBook = async (payload) => bookModel.addBook(payload);

export const replaceBook = async (id, payload) => {
  const updatedBook = await bookModel.updateBook(id, payload);

  if (!updatedBook) {
    throw new ServiceError('Livro não encontrado', 404);
  }

  return updatedBook;
};

export const deleteBook = async (id) => {
  const removed = await bookModel.removeBook(id);

  if (!removed) {
    throw new ServiceError('Livro não encontrado', 404);
  }
};
