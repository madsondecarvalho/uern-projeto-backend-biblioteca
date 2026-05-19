import { Book, Category, Author } from './index.js';

export const listBooks = async (filters = {}, pagination = {}) => {
  const where = {};

  if (filters.categoryId) {
    where.categoryId = Number(filters.categoryId);
  }

  if (filters.authorId) {
    where.authorId = Number(filters.authorId);
  }

  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 10));
  const offset = (page - 1) * limit;

  const { rows, count } = await Book.findAndCountAll({
    where,
    include: [Category, Author],
    limit,
    offset,
    order: [['id', 'ASC']],
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const findBook = async (id) => Book.findByPk(id, { include: [Category, Author] });

export const addBook = async (payload) => Book.create(payload);

export const updateBook = async (id, updates) => {
  const [affected] = await Book.update(updates, { where: { id } });

  if (affected === 0) return null;

  return Book.findByPk(id, { include: [Category, Author] });
};

export const removeBook = async (id) => {
  const deleted = await Book.destroy({ where: { id } });

  return deleted > 0;
};
