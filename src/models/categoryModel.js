import Category from './category.js';

export const listCategories = async () => Category.findAll({ order: [['name', 'ASC']] });

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
