import * as bookModel from '../src/models/bookModel.js';
import {
  listBooks,
  getBookById,
  createBook,
  replaceBook,
  deleteBook,
  ServiceError
} from '../src/services/bookService.js';

describe('bookService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('relays the list of books', async () => {
    const books = [{ id: 1 }];
    jest.spyOn(bookModel, 'listBooks').mockResolvedValue(books);

    await expect(listBooks()).resolves.toBe(books);
  });

  it('returns a book when found', async () => {
    const book = { id: 1 };
    jest.spyOn(bookModel, 'findBook').mockResolvedValue(book);

    await expect(getBookById(1)).resolves.toBe(book);
  });

  it('throws when the book is missing', async () => {
    jest.spyOn(bookModel, 'findBook').mockResolvedValue(undefined);

    await expect(getBookById(1)).rejects.toThrow(ServiceError);
    await expect(getBookById(1)).rejects.toThrow('Livro não encontrado');
  });

  it('creates a book', async () => {
    const payload = { title: 'book', authorId: 1, year: 2024, available: false };
    jest.spyOn(bookModel, 'addBook').mockResolvedValue({ id: 10, ...payload });

    await expect(createBook(payload)).resolves.toEqual({ id: 10, ...payload });
    expect(bookModel.addBook).toHaveBeenCalledWith(payload);
  });

  it('updates a book when present', async () => {
    const payload = { title: 'book', authorId: 1, year: 2023, available: true };
    jest.spyOn(bookModel, 'updateBook').mockResolvedValue({ id: 1, ...payload });

    await expect(replaceBook(1, payload)).resolves.toEqual({ id: 1, ...payload });
    expect(bookModel.updateBook).toHaveBeenCalledWith(1, payload);
  });

  it('throws when updating a missing book', async () => {
    jest.spyOn(bookModel, 'updateBook').mockResolvedValue(null);

    await expect(replaceBook(1, { title: 'book', authorId: 1, year: 2023 })).rejects.toThrow(ServiceError);
    await expect(replaceBook(1, { title: 'book', authorId: 1, year: 2023 })).rejects.toThrow('Livro não encontrado');
  });

  it('removes a book when available', async () => {
    jest.spyOn(bookModel, 'removeBook').mockResolvedValue(true);

    await expect(deleteBook(1)).resolves.toBeUndefined();
    expect(bookModel.removeBook).toHaveBeenCalledWith(1);
  });

  it('throws when deleting a missing book', async () => {
    jest.spyOn(bookModel, 'removeBook').mockResolvedValue(false);

    await expect(deleteBook(1)).rejects.toThrow(ServiceError);
    await expect(deleteBook(1)).rejects.toThrow('Livro não encontrado');
  });
});
