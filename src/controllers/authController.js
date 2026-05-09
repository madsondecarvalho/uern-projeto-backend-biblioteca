import * as userService from '../services/userService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json(result);
  } catch (err) {
    if (err instanceof userService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }

    throw err;
  }
};
