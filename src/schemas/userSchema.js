import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).min(1, 'Nome é obrigatório'),
  email: z.string({ required_error: 'Email é obrigatório' }).email('Email inválido'),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['user', 'admin'], { errorMap: () => ({ message: 'Role deve ser user ou admin' }) })
    .optional()
    .default('user'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  role: z.enum(['user', 'admin'], { errorMap: () => ({ message: 'Role deve ser user ou admin' }) })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email é obrigatório' }).email('Email inválido'),
  password: z.string({ required_error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
});
