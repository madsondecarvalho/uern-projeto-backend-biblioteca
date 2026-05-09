import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userModel from '../src/models/userModel.js';
import { login, ServiceError } from '../src/services/userService.js';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('authService (login)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns token and user on valid credentials', async () => {
    const user = { id: 1, name: 'Admin', email: 'admin@b.com', password: 'hash', role: 'admin' };

    jest.spyOn(userModel, 'findUserByEmail').mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-token');

    const result = await login('admin@b.com', 'admin123');

    expect(result).toEqual({
      token: 'fake-token',
      user: { id: 1, name: 'Admin', email: 'admin@b.com', role: 'admin' },
    });

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, role: 'admin' },
      expect.any(String),
      { expiresIn: '1d' }
    );
  });

  it('throws when user is not found', async () => {
    jest.spyOn(userModel, 'findUserByEmail').mockResolvedValue(null);

    await expect(login('bademail@e.com', '123456')).rejects.toThrow(ServiceError);
    await expect(login('bademail@e.com', '123456')).rejects.toThrow('Email ou senha inválidos');
  });

  it('throws when password does not match', async () => {
    jest.spyOn(userModel, 'findUserByEmail').mockResolvedValue({ id: 1, password: 'hash' });
    bcrypt.compare.mockResolvedValue(false);

    await expect(login('admin@b.com', 'wrong')).rejects.toThrow('Email ou senha inválidos');
  });
});
