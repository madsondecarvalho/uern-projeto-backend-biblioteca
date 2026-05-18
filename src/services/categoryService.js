import * as categoryModel from '../models/categoryModel.js';

export class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export const listCategories = async () => categoryModel.listCategories();

export const getCategoryById = async (id) => {
  const category = await categoryModel.findCategory(id);

  if (!category) {
    throw new ServiceError('Categoria não encontrada', 404);
  }

  return category;
};

export const createCategory = async (payload) => {
  try {
    return await categoryModel.addCategory(payload);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new ServiceError('Categoria já existe', 409);
    }
    throw err;
  }
};

export const replaceCategory = async (id, payload) => {
  const updatedCategory = await categoryModel.updateCategory(id, payload);

  if (!updatedCategory) {
    throw new ServiceError('Categoria não encontrada', 404);
  }

  return updatedCategory;
};

export const deleteCategory = async (id) => {
  const removed = await categoryModel.removeCategory(id);

  if (!removed) {
    throw new ServiceError('Categoria não encontrada', 404);
  }
};
