import { z } from 'zod';

const copyStatusEnum = z.enum(['AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST', 'RESERVED']);

export const createCopySchema = z.object({
  code: z.string({ required_error: 'Código é obrigatório' }).min(1, 'Código é obrigatório'),
  status: copyStatusEnum.optional().default('AVAILABLE'),
  bookId: z.number({ required_error: 'bookId é obrigatório' }).int().positive(),
});

export const updateCopySchema = z.object({
  code: z.string().min(1).optional(),
  status: copyStatusEnum.optional(),
  bookId: z.number().int().positive().optional(),
});
