import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(5, 'Senha deve ter pelo menos 5 caracteres'),
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  department: z.string().min(1, 'Departamento é obrigatório'),
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  role: z.enum(['viewer', 'analyst', 'admin']).default('viewer'),
});

export const userUpdateSchema = z.object({
  fullName: z.string().min(2, 'Nome completo é obrigatório').optional(),
  department: z.string().min(1, 'Departamento é obrigatório').optional(),
  cargo: z.string().min(1, 'Cargo é obrigatório').optional(),
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
  avatar: z.string().optional(),
});

export const loginSchema = z.object({
  login: z.string().min(1, 'Usuário ou email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
