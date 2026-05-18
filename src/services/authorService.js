import * as authorModel from '../models/authorModel.js';

export class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export const listAuthors = async () => authorModel.listAuthors();

export const getAuthorById = async (id) => {
  const author = await authorModel.findAuthor(id);

  if (!author) {
    throw new ServiceError('Autor não encontrado', 404);
  }

  return author;
};

export const createAuthor = async (payload) => {
  try {
    return await authorModel.addAuthor(payload);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new ServiceError('Autor já existe', 409);
    }
    throw err;
  }
};

export const replaceAuthor = async (id, payload) => {
  const updatedAuthor = await authorModel.updateAuthor(id, payload);

  if (!updatedAuthor) {
    throw new ServiceError('Autor não encontrado', 404);
  }

  return updatedAuthor;
};

export const deleteAuthor = async (id) => {
  const removed = await authorModel.removeAuthor(id);

  if (!removed) {
    throw new ServiceError('Autor não encontrado', 404);
  }
};
