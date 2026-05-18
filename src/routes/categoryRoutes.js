import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  replaceCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchema.js';

const router = Router();

router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', authenticate, adminOnly, validate(createCategorySchema), createCategory);
router.put('/categories/:id', authenticate, adminOnly, validate(updateCategorySchema), replaceCategory);
router.delete('/categories/:id', authenticate, adminOnly, deleteCategory);

export default router;
