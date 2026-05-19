import User from './user.js';

export const listUsers = async (pagination = {}) => {
  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 10));
  const offset = (page - 1) * limit;

  const { rows, count } = await User.findAndCountAll({
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

export const findUserById = async (id) => User.findByPk(id);

export const findUserByEmail = async (email) => User.unscoped().findOne({ where: { email } });

export const addUser = async (payload) => User.create(payload);

export const updateUser = async (id, updates) => {
  const [affected] = await User.update(updates, { where: { id } });

  if (affected === 0) return null;

  return User.findByPk(id);
};

export const removeUser = async (id) => {
  const deleted = await User.destroy({ where: { id } });

  return deleted > 0;
};
