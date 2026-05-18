import Author from './author.js';

export const listAuthors = async () => Author.findAll({ order: [['name', 'ASC']] });

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
