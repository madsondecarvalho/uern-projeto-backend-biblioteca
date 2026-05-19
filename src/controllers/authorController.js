import * as authorService from '../services/authorService.js';

export const getAllAuthors = async (req, res) => {
  const { page, limit } = req.query;
  res.json(await authorService.listAuthors({ page, limit }));
};

export const getAuthorById = async (req, res) => {
  try {
    const author = await authorService.getAuthorById(Number(req.params.id));
    res.json(author);
  } catch (err) {
    if (err instanceof authorService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const createAuthor = async (req, res) => {
  try {
    const newAuthor = await authorService.createAuthor(req.body);
    res.status(201).json(newAuthor);
  } catch (err) {
    if (err instanceof authorService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const replaceAuthor = async (req, res) => {
  try {
    const updatedAuthor = await authorService.replaceAuthor(Number(req.params.id), req.body);
    res.json(updatedAuthor);
  } catch (err) {
    if (err instanceof authorService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const deleteAuthor = async (req, res) => {
  try {
    await authorService.deleteAuthor(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    if (err instanceof authorService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};
