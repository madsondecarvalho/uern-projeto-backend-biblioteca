import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string({ required_error: 'Título é obrigatório' }).min(1, 'Título é obrigatório'),
  author: z.string({ required_error: 'Autor é obrigatório' }).min(1, 'Autor é obrigatório'),
  year: z
    .number({ required_error: 'Ano é obrigatório', invalid_type_error: 'Ano deve ser um número' })
    .int('Ano deve ser um número inteiro'),
  available: z.boolean().optional().default(true),
});

export const replaceBookSchema = z.object({
  title: z.string({ required_error: 'Título é obrigatório' }).min(1, 'Título é obrigatório'),
  author: z.string({ required_error: 'Autor é obrigatório' }).min(1, 'Autor é obrigatório'),
  year: z
    .number({ required_error: 'Ano é obrigatório', invalid_type_error: 'Ano deve ser um número' })
    .int('Ano deve ser um número inteiro'),
  available: z.boolean({ required_error: 'Disponibilidade é obrigatória' }),
});
