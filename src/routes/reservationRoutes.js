import { Router } from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
} from '../controllers/reservationController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createReservationSchema, updateReservationSchema } from '../schemas/reservationSchema.js';

const router = Router();

router.get('/reservations', authenticate, getAllReservations);
router.get('/reservations/:id', authenticate, getReservationById);
router.post('/reservations', authenticate, validate(createReservationSchema), createReservation);
router.put('/reservations/:id', authenticate, adminOnly, validate(updateReservationSchema), updateReservation);
router.delete('/reservations/:id', authenticate, adminOnly, deleteReservation);

export default router;
