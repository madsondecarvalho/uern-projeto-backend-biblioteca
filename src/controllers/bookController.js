import * as bookService from '../services/bookService.js';

export const getAllBooks = async (req, res) => {
  res.json(await bookService.listBooks(req.query));
};

export const getBookById = async (req, res) => {
  try {
    const book = await bookService.getBookById(Number(req.params.id));
    res.json(book);
  } catch (err) {
    if (err instanceof bookService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};

export const createBook = async (req, res) => {
  try {
    const newBook = await bookService.createBook(req.body);
    res.status(201).json(newBook);
  } catch (err) {
    if (err instanceof bookService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};

export const replaceBook = async (req, res) => {
  try {
    const updatedBook = await bookService.replaceBook(Number(req.params.id), req.body);
    res.json(updatedBook);
  } catch (err) {
    if (err instanceof bookService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};

export const deleteBook = async (req, res) => {
  try {
    await bookService.deleteBook(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    if (err instanceof bookService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};
