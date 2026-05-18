import { z } from 'zod';

export const createAuthorSchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).min(1, 'Nome é obrigatório'),
});

export const updateAuthorSchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).min(1, 'Nome é obrigatório'),
});
