import Author from './author.js';

export const listAuthors = async (pagination = {}) => {
  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 10));
  const offset = (page - 1) * limit;

  const { rows, count } = await Author.findAndCountAll({
    order: [['name', 'ASC']],
    limit,
    offset,
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

export const findAuthor = async (id) => Author.findByPk(id);

export const addAuthor = async (payload) => Author.create(payload);

export const updateAuthor = async (id, updates) => {
  const [affected] = await Author.update(updates, { where: { id } });

  if (affected === 0) return null;

  return Author.findByPk(id);
};

export const removeAuthor = async (id) => {
  const deleted = await Author.destroy({ where: { id } });

  return deleted > 0;
};
