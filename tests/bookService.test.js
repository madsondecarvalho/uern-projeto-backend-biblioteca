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

  it('relays the list of books', () => {
    const books = [{ id: 1 }];
    jest.spyOn(bookModel, 'listBooks').mockReturnValue(books);

    expect(listBooks()).toBe(books);
  });

  it('returns a book when found', () => {
    const book = { id: 1 };
    jest.spyOn(bookModel, 'findBook').mockReturnValue(book);

    expect(getBookById(1)).toBe(book);
  });

  it('throws when the book is missing', () => {
    jest.spyOn(bookModel, 'findBook').mockReturnValue(undefined);

    expect(() => getBookById(1)).toThrow(ServiceError);
    expect(() => getBookById(1)).toThrow('Livro não encontrado');
  });

  it('creates a book with normalized availability', () => {
    const payload = { title: 'book', author: 'author', year: 2024, available: 0 };
    jest.spyOn(bookModel, 'addBook').mockReturnValue({ id: 10, ...payload, available: false });

    expect(createBook(payload)).toEqual({ id: 10, ...payload, available: false });
    expect(bookModel.addBook).toHaveBeenCalledWith({
      ...payload,
      available: false
    });
  });

  it('rejects invalid payloads', () => {
    expect(() => createBook({ title: 'book', author: 'author' })).toThrow(ServiceError);
    expect(() => createBook({ title: 'book', author: 'author' })).toThrow('Título, autor e ano são obrigatórios');
  });

  it('updates a book when present', () => {
    const payload = { title: 'book', author: 'author', year: 2023, available: 1 };
    jest.spyOn(bookModel, 'updateBook').mockReturnValue({ id: 1, ...payload, available: true });

    expect(replaceBook(1, payload)).toEqual({ id: 1, ...payload, available: true });
    expect(bookModel.updateBook).toHaveBeenCalledWith(1, {
      ...payload,
      available: true
    });
  });

  it('throws when updating a missing book', () => {
    jest.spyOn(bookModel, 'updateBook').mockReturnValue(null);

    expect(() => replaceBook(1, { title: 'book', author: 'a', year: 2023 })).toThrow(ServiceError);
    expect(() => replaceBook(1, { title: 'book', author: 'a', year: 2023 })).toThrow('Livro não encontrado');
  });

  it('removes a book when available', () => {
    jest.spyOn(bookModel, 'removeBook').mockReturnValue(true);

    expect(deleteBook(1)).toBeUndefined();
    expect(bookModel.removeBook).toHaveBeenCalledWith(1);
  });

  it('throws when deleting a missing book', () => {
    jest.spyOn(bookModel, 'removeBook').mockReturnValue(false);

    expect(() => deleteBook(1)).toThrow(ServiceError);
    expect(() => deleteBook(1)).toThrow('Livro não encontrado');
  });
});
