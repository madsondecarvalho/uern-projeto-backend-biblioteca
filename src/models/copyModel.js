import { Copy, Book } from './index.js';

export const listCopies = async (filters = {}, pagination = {}) => {
  const where = {};

  if (filters.bookId) where.bookId = Number(filters.bookId);
  if (filters.status) where.status = filters.status;

  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 10));
  const offset = (page - 1) * limit;

  const { rows, count } = await Copy.findAndCountAll({
    where,
    include: Book,
    limit,
    offset,
    order: [['id', 'ASC']],
  });

  return {
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
};

export const findCopy = async (id) => Copy.findByPk(id, { include: Book });

export const findCopyByCode = async (code) => Copy.findOne({ where: { code } });

export const addCopy = async (payload) => Copy.create(payload);

export const updateCopy = async (id, updates) => {
  const [affected] = await Copy.update(updates, { where: { id } });
  if (affected === 0) return null;
  return Copy.findByPk(id, { include: Book });
};

export const removeCopy = async (id) => {
  const deleted = await Copy.destroy({ where: { id } });
  return deleted > 0;
};
