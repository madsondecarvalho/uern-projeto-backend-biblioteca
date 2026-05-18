import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string({ required_error: 'Título é obrigatório' }).min(1, 'Título é obrigatório'),
  authorId: z.number({ required_error: 'Autor é obrigatório', invalid_type_error: 'Autor deve ser um ID numérico' })
    .int('ID do autor deve ser um número inteiro')
    .positive('ID do autor deve ser positivo'),
  year: z
    .number({ required_error: 'Ano é obrigatório', invalid_type_error: 'Ano deve ser um número' })
    .int('Ano deve ser um número inteiro'),
  available: z.boolean().optional().default(true),
  categoryId: z.number().int().positive().optional().nullable().default(null),
});

export const replaceBookSchema = z.object({
  title: z.string({ required_error: 'Título é obrigatório' }).min(1, 'Título é obrigatório'),
  authorId: z.number({ required_error: 'Autor é obrigatório', invalid_type_error: 'Autor deve ser um ID numérico' })
    .int('ID do autor deve ser um número inteiro')
    .positive('ID do autor deve ser positivo'),
  year: z
    .number({ required_error: 'Ano é obrigatório', invalid_type_error: 'Ano deve ser um número' })
    .int('Ano deve ser um número inteiro'),
  available: z.boolean({ required_error: 'Disponibilidade é obrigatória' }),
  categoryId: z.number().int().positive().optional().nullable(),
});
