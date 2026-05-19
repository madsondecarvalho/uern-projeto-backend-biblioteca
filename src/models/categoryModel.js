import Category from './category.js';

export const listCategories = async (pagination = {}) => {
  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 10));
  const offset = (page - 1) * limit;

  const { rows, count } = await Category.findAndCountAll({
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

export const findCategory = async (id) => Category.findByPk(id);

export const addCategory = async (payload) => Category.create(payload);

export const updateCategory = async (id, updates) => {
  const [affected] = await Category.update(updates, { where: { id } });

  if (affected === 0) return null;

  return Category.findByPk(id);
};

export const removeCategory = async (id) => {
  const deleted = await Category.destroy({ where: { id } });

  return deleted > 0;
};
