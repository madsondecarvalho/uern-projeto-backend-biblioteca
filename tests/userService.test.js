import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userModel from '../src/models/userModel.js';
import { listUsers, getUserById, createUser, replaceUser, deleteUser, ServiceError } from '../src/services/userService.js';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('userService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('listUsers', () => {
    it('relays the list of users', async () => {
      const users = [{ id: 1, name: 'User' }];
      jest.spyOn(userModel, 'listUsers').mockResolvedValue(users);

      await expect(listUsers()).resolves.toBe(users);
    });
  });

  describe('getUserById', () => {
    it('returns a user when found', async () => {
      const user = { id: 1, name: 'User' };
      jest.spyOn(userModel, 'findUserById').mockResolvedValue(user);

      await expect(getUserById(1)).resolves.toBe(user);
    });

    it('throws when the user is missing', async () => {
      jest.spyOn(userModel, 'findUserById').mockResolvedValue(null);

      await expect(getUserById(99)).rejects.toThrow(ServiceError);
      await expect(getUserById(99)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('createUser', () => {
    it('creates a user with hashed password', async () => {
      const payload = { name: 'User', email: 'u@e.com', password: '123456' };
      jest.spyOn(userModel, 'findUserByEmail').mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      jest.spyOn(userModel, 'addUser').mockResolvedValue({ id: 10, name: 'User', email: 'u@e.com' });

      await expect(createUser(payload)).resolves.toMatchObject({ id: 10, name: 'User' });
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(userModel.addUser).toHaveBeenCalledWith({ ...payload, password: 'hashed-password' });
    });

    it('throws when email is already taken', async () => {
      jest.spyOn(userModel, 'findUserByEmail').mockResolvedValue({ id: 1 });

      await expect(createUser({ name: 'U', email: 'u@e.com', password: '123456' }))
        .rejects.toThrow('Email já cadastrado');
    });
  });

  describe('replaceUser', () => {
    it('updates a user', async () => {
      jest.spyOn(userModel, 'findUserById').mockResolvedValue({ id: 1, email: 'u@e.com' });
      jest.spyOn(userModel, 'updateUser').mockResolvedValue({ id: 1, name: 'Updated' });

      await expect(replaceUser(1, { name: 'Updated' })).resolves.toMatchObject({ name: 'Updated' });
    });

    it('throws when user is missing', async () => {
      jest.spyOn(userModel, 'findUserById').mockResolvedValue(null);

      await expect(replaceUser(99, { name: 'X' })).rejects.toThrow('Usuário não encontrado');
    });

    it('throws when new email is already taken', async () => {
      jest.spyOn(userModel, 'findUserById').mockResolvedValue({ id: 1, email: 'old@e.com' });
      jest.spyOn(userModel, 'findUserByEmail').mockResolvedValue({ id: 2 });

      await expect(replaceUser(1, { email: 'new@e.com' })).rejects.toThrow('Email já cadastrado');
    });

    it('hashes password when provided', async () => {
      jest.spyOn(userModel, 'findUserById').mockResolvedValue({ id: 1, email: 'u@e.com' });
      bcrypt.hash.mockResolvedValue('new-hash');
      jest.spyOn(userModel, 'updateUser').mockResolvedValue({ id: 1 });

      await replaceUser(1, { password: 'newpass' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(userModel.updateUser).toHaveBeenCalledWith(1, { password: 'new-hash' });
    });
  });

  describe('deleteUser', () => {
    it('removes a user when found', async () => {
      jest.spyOn(userModel, 'removeUser').mockResolvedValue(true);

      await expect(deleteUser(1)).resolves.toBeUndefined();
      expect(userModel.removeUser).toHaveBeenCalledWith(1);
    });

    it('throws when user is missing', async () => {
      jest.spyOn(userModel, 'removeUser').mockResolvedValue(false);

      await expect(deleteUser(99)).rejects.toThrow('Usuário não encontrado');
    });
  });
});
