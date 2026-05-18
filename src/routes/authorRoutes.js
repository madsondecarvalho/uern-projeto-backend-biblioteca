import { Router } from 'express';
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  replaceAuthor,
  deleteAuthor,
} from '../controllers/authorController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createAuthorSchema, updateAuthorSchema } from '../schemas/authorSchema.js';

const router = Router();

router.get('/authors', getAllAuthors);
router.get('/authors/:id', getAuthorById);
router.post('/authors', authenticate, adminOnly, validate(createAuthorSchema), createAuthor);
router.put('/authors/:id', authenticate, adminOnly, validate(updateAuthorSchema), replaceAuthor);
router.delete('/authors/:id', authenticate, adminOnly, deleteAuthor);

export default router;
