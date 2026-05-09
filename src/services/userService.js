import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'biblioteca-secret';

export class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

const hashPassword = (password) => bcrypt.hash(password, 10);

const generateToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  JWT_SECRET,
  { expiresIn: '1d' }
);

export const login = async (email, password) => {
  const user = await userModel.findUserByEmail(email);

  if (!user) {
    throw new ServiceError('Email ou senha inválidos', 401);
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new ServiceError('Email ou senha inválidos', 401);
  }

  return {
    token: generateToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const listUsers = async () => userModel.listUsers();

export const getUserById = async (id) => {
  const user = await userModel.findUserById(id);

  if (!user) {
    throw new ServiceError('Usuário não encontrado', 404);
  }

  return user;
};

export const createUser = async (payload) => {
  const existing = await userModel.findUserByEmail(payload.email);

  if (existing) {
    throw new ServiceError('Email já cadastrado', 409);
  }

  const hashed = await hashPassword(payload.password);

  return userModel.addUser({ ...payload, password: hashed });
};

export const replaceUser = async (id, payload) => {
  const user = await userModel.findUserById(id);

  if (!user) {
    throw new ServiceError('Usuário não encontrado', 404);
  }

  if (payload.email && payload.email !== user.email) {
    const existing = await userModel.findUserByEmail(payload.email);

    if (existing) {
      throw new ServiceError('Email já cadastrado', 409);
    }
  }

  const data = { ...payload };

  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  return userModel.updateUser(id, data);
};

export const deleteUser = async (id) => {
  const removed = await userModel.removeUser(id);

  if (!removed) {
    throw new ServiceError('Usuário não encontrado', 404);
  }
};
