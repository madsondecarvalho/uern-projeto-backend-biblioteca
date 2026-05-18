import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).min(1, 'Nome é obrigatório'),
});

export const updateCategorySchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).min(1, 'Nome é obrigatório'),
});
