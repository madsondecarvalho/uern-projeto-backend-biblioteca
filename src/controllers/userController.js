import * as userService from '../services/userService.js';

export const getAllUsers = async (req, res) => {
  const { page, limit } = req.query;
  res.json(await userService.listUsers({ page, limit }));
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    res.json(user);
  } catch (err) {
    if (err instanceof userService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    if (err instanceof userService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};

export const replaceUser = async (req, res) => {
  try {
    const updatedUser = await userService.replaceUser(Number(req.params.id), req.body);
    res.json(updatedUser);
  } catch (err) {
    if (err instanceof userService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    if (err instanceof userService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};
