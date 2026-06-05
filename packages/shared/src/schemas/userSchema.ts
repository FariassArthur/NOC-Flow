import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter maiúscula, minúscula e número'),
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  department: z.string().min(1, 'Departamento é obrigatório'),
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  role: z.enum(['viewer', 'analyst', 'admin']).default('viewer'),
});

// Schema para registro público - exclui o departamento NOC
export const userRegisterSchema = z.object({
  username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter maiúscula, minúscula e número'),
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  department: z.string()
    .min(1, 'Departamento é obrigatório')
    .refine((dept) => dept.toUpperCase() !== 'NOC', {
      message: 'O setor NOC só pode ser criado por um administrador'
    }),
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  role: z.enum(['viewer', 'analyst']).default('viewer'),
});

// Schema para criar usuários NOC - apenas para admins
export const userNocSchema = z.object({
  username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter maiúscula, minúscula e número'),
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  department: z.literal('NOC'),
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  role: z.enum(['viewer', 'analyst', 'admin']).default('admin'),
});

export const userUpdateSchema = z.object({
  username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
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
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserNocInput = z.infer<typeof userNocSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
