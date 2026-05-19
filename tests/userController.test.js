import { jest } from '@jest/globals';
import * as userController from '../src/controllers/userController.js';
import * as userService from '../src/services/userService.js';

const { getAllUsers, getUserById, createUser, replaceUser, deleteUser } = userController;
const { ServiceError } = userService;

const response = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all users', async () => {
    const req = { query: {} };
    const res = response();
    const users = [{ id: 1, name: 'User' }];
    jest.spyOn(userService, 'listUsers').mockResolvedValue(users);

    await getAllUsers(req, res);

    expect(res.json).toHaveBeenCalledWith(users);
  });

  it('returns a user when found', async () => {
    const res = response();
    const req = { params: { id: '1' } };
    const user = { id: 1, name: 'User' };
    jest.spyOn(userService, 'getUserById').mockResolvedValue(user);

    await getUserById(req, res);

    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('handles user not found', async () => {
    const res = response();
    const req = { params: { id: '99' } };
    jest.spyOn(userService, 'getUserById').mockRejectedValue(new ServiceError('Usuário não encontrado', 404));

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
  });

  it('creates a user and returns 201', async () => {
    const body = { name: 'User', email: 'u@e.com', password: '123456' };
    const req = { body };
    const res = response();
    jest.spyOn(userService, 'createUser').mockResolvedValue({ id: 1, ...body });

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, ...body });
  });

  it('replaces a user', async () => {
    const req = { params: { id: '1' }, body: { name: 'Updated' } };
    const res = response();
    jest.spyOn(userService, 'replaceUser').mockResolvedValue({ id: 1, name: 'Updated' });

    await replaceUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Updated' });
  });

  it('deletes a user and sends 204', async () => {
    const req = { params: { id: '1' } };
    const res = response();
    jest.spyOn(userService, 'deleteUser').mockResolvedValue(undefined);

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('handles email conflict on create', async () => {
    const req = { body: { name: 'U', email: 'u@e.com', password: '123456' } };
    const res = response();
    jest.spyOn(userService, 'createUser').mockRejectedValue(new ServiceError('Email já cadastrado', 409));

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });
});
