import { z } from 'zod';

const reservationStatusEnum = z.enum(['PENDING', 'PICKED_UP', 'CANCELLED', 'EXPIRED']);

export const createReservationSchema = z.object({
  copyId: z.number({ required_error: 'copyId é obrigatório' }).int().positive(),
});

export const updateReservationSchema = z.object({
  status: reservationStatusEnum,
});
