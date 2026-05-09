import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  replaceUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../schemas/userSchema.js';

const router = Router();

router.get('/users', authenticate, getAllUsers);
router.get('/users/:id', authenticate, getUserById);
router.post('/users', authenticate, adminOnly, validate(createUserSchema), createUser);
router.put('/users/:id', authenticate, adminOnly, validate(updateUserSchema), replaceUser);
router.delete('/users/:id', authenticate, adminOnly, deleteUser);

export default router;
