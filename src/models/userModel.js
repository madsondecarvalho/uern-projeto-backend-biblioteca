import User from './user.js';

export const listUsers = async () => User.findAll();

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
