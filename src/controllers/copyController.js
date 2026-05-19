import * as copyService from '../services/copyService.js';

export const getAllCopies = async (req, res) => {
  const { page, limit, ...filters } = req.query;
  res.json(await copyService.listCopies(filters, { page, limit }));
};

export const getCopyById = async (req, res) => {
  try {
    const copy = await copyService.getCopyById(Number(req.params.id));
    res.json(copy);
  } catch (err) {
    if (err instanceof copyService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const createCopy = async (req, res) => {
  try {
    const newCopy = await copyService.createCopy(req.body);
    res.status(201).json(newCopy);
  } catch (err) {
    if (err instanceof copyService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const replaceCopy = async (req, res) => {
  try {
    const updated = await copyService.replaceCopy(Number(req.params.id), req.body);
    res.json(updated);
  } catch (err) {
    if (err instanceof copyService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const deleteCopy = async (req, res) => {
  try {
    await copyService.deleteCopy(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    if (err instanceof copyService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};
