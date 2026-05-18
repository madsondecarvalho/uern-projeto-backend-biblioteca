import * as categoryService from '../services/categoryService.js';

export const getAllCategories = async (req, res) => {
  res.json(await categoryService.listCategories());
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(Number(req.params.id));
    res.json(category);
  } catch (err) {
    if (err instanceof categoryService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const createCategory = async (req, res) => {
  try {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json(newCategory);
  } catch (err) {
    if (err instanceof categoryService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const replaceCategory = async (req, res) => {
  try {
    const updatedCategory = await categoryService.replaceCategory(Number(req.params.id), req.body);
    res.json(updatedCategory);
  } catch (err) {
    if (err instanceof categoryService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    if (err instanceof categoryService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};
