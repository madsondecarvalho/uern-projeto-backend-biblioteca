import * as bookService from '../services/bookService.js';

export const getAllBooks = (req, res) => {
  res.json(bookService.listBooks());
};

export const getBookById = (req, res) => {
  try {
    const book = bookService.getBookById(Number(req.params.id));
    res.json(book);
  } catch (err) {
    if (err instanceof bookService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};

export const createBook = (req, res) => {
  const { title, author, year, available } = req.body;

  try {
    const newBook = bookService.createBook({ title, author, year, available });
    res.status(201).json(newBook);
  } catch (err) {
    if (err instanceof bookService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};

export const replaceBook = (req, res) => {
  const id = Number(req.params.id);
  const { title, author, year, available } = req.body;

  try {
    const updatedBook = bookService.replaceBook(id, { title, author, year, available });
    res.json(updatedBook);
  } catch (err) {
    if (err instanceof bookService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};

export const deleteBook = (req, res) => {
  try {
    bookService.deleteBook(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    if (err instanceof bookService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};
