import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  replaceBook,
  deleteBook
} from '../controllers/bookController.js';
import validate from '../middleware/validate.js';
import { createBookSchema, replaceBookSchema } from '../schemas/bookSchema.js';

const router = Router();

router.get('/books', getAllBooks);
router.get('/books/:id', getBookById);
router.post('/books', validate(createBookSchema), createBook);
router.put('/books/:id', validate(replaceBookSchema), replaceBook);
router.delete('/books/:id', deleteBook);

export default router;
