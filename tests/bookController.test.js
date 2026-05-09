import { jest } from '@jest/globals';
import * as bookController from '../src/controllers/bookController.js';
import * as bookService from '../src/services/bookService.js';

const { getAllBooks, getBookById, createBook, replaceBook, deleteBook } = bookController;
const { ServiceError } = bookService;

const response = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

describe('bookController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all books', async () => {
    const res = response();
    const books = [{ id: 1 }];
    jest.spyOn(bookService, 'listBooks').mockResolvedValue(books);

    await getAllBooks(null, res);

    expect(res.json).toHaveBeenCalledWith(books);
  });

  it('returns a book when service resolves', async () => {
    const res = response();
    const req = { params: { id: '1' } };
    const book = { id: 1 };
    jest.spyOn(bookService, 'getBookById').mockResolvedValue(book);

    await getBookById(req, res);

    expect(res.json).toHaveBeenCalledWith(book);
  });

  it('handles service errors gracefully', async () => {
    const res = response();
    const req = { params: { id: '1' } };
    const error = new ServiceError('not found', 404);
    jest.spyOn(bookService, 'getBookById').mockRejectedValue(error);

    await getBookById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'not found' });
  });

  it('creates a book and returns 201', async () => {
    const body = { title: 'book', author: 'author', year: 2024, available: true };
    const req = { body };
    const res = response();
    jest.spyOn(bookService, 'createBook').mockResolvedValue({ ...body, id: 1 });

    await createBook(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...body, id: 1 });
  });

  it('replaces a book', async () => {
    const req = { params: { id: '1' }, body: { title: 'book', author: 'author', year: 2024, available: true } };
    const res = response();
    const updated = { ...req.body, id: 1 };
    jest.spyOn(bookService, 'replaceBook').mockResolvedValue(updated);

    await replaceBook(req, res);

    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('deletes a book and sends 204', async () => {
    const req = { params: { id: '1' } };
    const res = response();
    jest.spyOn(bookService, 'deleteBook').mockResolvedValue(undefined);

    await deleteBook(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
