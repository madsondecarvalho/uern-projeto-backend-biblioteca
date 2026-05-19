import { Router } from 'express';
import {
  getAllCopies,
  getCopyById,
  createCopy,
  replaceCopy,
  deleteCopy,
} from '../controllers/copyController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createCopySchema, updateCopySchema } from '../schemas/copySchema.js';

const router = Router();

router.get('/copies', getAllCopies);
router.get('/copies/:id', getCopyById);
router.post('/copies', authenticate, adminOnly, validate(createCopySchema), createCopy);
router.put('/copies/:id', authenticate, adminOnly, validate(updateCopySchema), replaceCopy);
router.delete('/copies/:id', authenticate, adminOnly, deleteCopy);

export default router;
