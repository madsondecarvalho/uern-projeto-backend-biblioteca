import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  replaceBook,
  deleteBook
} from '../controllers/bookController.js';

const router = Router();

router.get('/books', getAllBooks);
router.get('/books/:id', getBookById);
router.post('/books', createBook);
router.put('/books/:id', replaceBook);
router.delete('/books/:id', deleteBook);

export default router;
