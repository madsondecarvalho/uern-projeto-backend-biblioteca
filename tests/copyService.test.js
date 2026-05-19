import * as copyModel from '../src/models/copyModel.js';
import {
  listCopies,
  getCopyById,
  createCopy,
  replaceCopy,
  deleteCopy,
  ServiceError,
} from '../src/services/copyService.js';

describe('copyService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('relays the list of copies', async () => {
    const copies = [{ id: 1 }];
    jest.spyOn(copyModel, 'listCopies').mockResolvedValue(copies);

    await expect(listCopies()).resolves.toBe(copies);
  });

  it('returns a copy when found', async () => {
    const copy = { id: 1, code: 'BC-001' };
    jest.spyOn(copyModel, 'findCopy').mockResolvedValue(copy);

    await expect(getCopyById(1)).resolves.toBe(copy);
  });

  it('throws when the copy is missing', async () => {
    jest.spyOn(copyModel, 'findCopy').mockResolvedValue(undefined);

    await expect(getCopyById(1)).rejects.toThrow(ServiceError);
    await expect(getCopyById(1)).rejects.toThrow('Cópia não encontrada');
  });

  it('creates a copy', async () => {
    const payload = { code: 'BC-100', bookId: 1 };
    jest.spyOn(copyModel, 'addCopy').mockResolvedValue({ id: 10, ...payload });

    await expect(createCopy(payload)).resolves.toEqual({ id: 10, ...payload });
    expect(copyModel.addCopy).toHaveBeenCalledWith(payload);
  });

  it('throws 409 when code is duplicated', async () => {
    const payload = { code: 'BC-001', bookId: 1 };
    const err = new Error('Unique constraint');
    err.name = 'SequelizeUniqueConstraintError';
    jest.spyOn(copyModel, 'addCopy').mockRejectedValue(err);

    await expect(createCopy(payload)).rejects.toThrow(ServiceError);
    await expect(createCopy(payload)).rejects.toThrow('Código já cadastrado');
  });

  it('updates a copy when present', async () => {
    const payload = { code: 'BC-001', status: 'MAINTENANCE' };
    jest.spyOn(copyModel, 'updateCopy').mockResolvedValue({ id: 1, bookId: 1, ...payload });

    await expect(replaceCopy(1, payload)).resolves.toEqual({ id: 1, bookId: 1, ...payload });
    expect(copyModel.updateCopy).toHaveBeenCalledWith(1, payload);
  });

  it('throws when updating a missing copy', async () => {
    jest.spyOn(copyModel, 'updateCopy').mockResolvedValue(null);

    await expect(replaceCopy(99, { code: 'X' })).rejects.toThrow(ServiceError);
    await expect(replaceCopy(99, { code: 'X' })).rejects.toThrow('Cópia não encontrada');
  });

  it('removes a copy when available', async () => {
    jest.spyOn(copyModel, 'removeCopy').mockResolvedValue(true);

    await expect(deleteCopy(1)).resolves.toBeUndefined();
    expect(copyModel.removeCopy).toHaveBeenCalledWith(1);
  });

  it('throws when deleting a missing copy', async () => {
    jest.spyOn(copyModel, 'removeCopy').mockResolvedValue(false);

    await expect(deleteCopy(99)).rejects.toThrow(ServiceError);
    await expect(deleteCopy(99)).rejects.toThrow('Cópia não encontrada');
  });
});
