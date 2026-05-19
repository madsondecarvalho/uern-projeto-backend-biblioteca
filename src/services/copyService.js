import * as copyModel from '../models/copyModel.js';

export class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

const PG = (filters = {}, pagination = {}) => copyModel.listCopies(filters, pagination);

export const listCopies = PG;

export const getCopyById = async (id) => {
  const copy = await copyModel.findCopy(id);
  if (!copy) throw new ServiceError('Cópia não encontrada', 404);
  return copy;
};

export const createCopy = async (payload) => {
  try {
    return await copyModel.addCopy(payload);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new ServiceError('Código já cadastrado', 409);
    }
    throw err;
  }
};

export const replaceCopy = async (id, payload) => {
  const updated = await copyModel.updateCopy(id, payload);
  if (!updated) throw new ServiceError('Cópia não encontrada', 404);
  return updated;
};

export const deleteCopy = async (id) => {
  const removed = await copyModel.removeCopy(id);
  if (!removed) throw new ServiceError('Cópia não encontrada', 404);
};
