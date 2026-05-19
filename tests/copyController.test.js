import { jest } from '@jest/globals';
import * as copyController from '../src/controllers/copyController.js';
import * as copyService from '../src/services/copyService.js';

const { getAllCopies, getCopyById, createCopy, replaceCopy, deleteCopy } = copyController;
const { ServiceError } = copyService;

const response = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

describe('copyController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all copies', async () => {
    const req = { query: {} };
    const res = response();
    const copies = [{ id: 1 }];
    jest.spyOn(copyService, 'listCopies').mockResolvedValue(copies);

    await getAllCopies(req, res);

    expect(res.json).toHaveBeenCalledWith(copies);
  });

  it('returns a copy when service resolves', async () => {
    const res = response();
    const req = { params: { id: '1' } };
    const copy = { id: 1, code: 'BC-001' };
    jest.spyOn(copyService, 'getCopyById').mockResolvedValue(copy);

    await getCopyById(req, res);

    expect(res.json).toHaveBeenCalledWith(copy);
  });

  it('handles service errors gracefully', async () => {
    const res = response();
    const req = { params: { id: '1' } };
    const error = new ServiceError('Cópia não encontrada', 404);
    jest.spyOn(copyService, 'getCopyById').mockRejectedValue(error);

    await getCopyById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cópia não encontrada' });
  });

  it('creates a copy and returns 201', async () => {
    const body = { code: 'BC-100', bookId: 1 };
    const req = { body };
    const res = response();
    jest.spyOn(copyService, 'createCopy').mockResolvedValue({ ...body, id: 1 });

    await createCopy(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...body, id: 1 });
  });

  it('handles create errors gracefully', async () => {
    const req = { body: { code: 'BC-001', bookId: 1 } };
    const res = response();
    const error = new ServiceError('Código já cadastrado', 409);
    jest.spyOn(copyService, 'createCopy').mockRejectedValue(error);

    await createCopy(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Código já cadastrado' });
  });

  it('replaces a copy', async () => {
    const req = { params: { id: '1' }, body: { code: 'BC-001', status: 'MAINTENANCE', bookId: 1 } };
    const res = response();
    const updated = { ...req.body, id: 1 };
    jest.spyOn(copyService, 'replaceCopy').mockResolvedValue(updated);

    await replaceCopy(req, res);

    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('handles replace errors gracefully', async () => {
    const req = { params: { id: '99' }, body: { code: 'X' } };
    const res = response();
    const error = new ServiceError('Cópia não encontrada', 404);
    jest.spyOn(copyService, 'replaceCopy').mockRejectedValue(error);

    await replaceCopy(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deletes a copy and sends 204', async () => {
    const req = { params: { id: '1' } };
    const res = response();
    jest.spyOn(copyService, 'deleteCopy').mockResolvedValue(undefined);

    await deleteCopy(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('handles delete errors gracefully', async () => {
    const req = { params: { id: '99' } };
    const res = response();
    const error = new ServiceError('Cópia não encontrada', 404);
    jest.spyOn(copyService, 'deleteCopy').mockRejectedValue(error);

    await deleteCopy(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cópia não encontrada' });
  });
});
