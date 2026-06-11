import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, fullName, department, cargo, role } = req.body;
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Usuário';
      return res.status(409).json({ error: `${field} já está em uso` });
    }
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      department,
      cargo,
      role,
    });
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    logger.error('[createUser]', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Usuário ou email já cadastrado' });
    }
    res.status(400).json({ error: 'Erro ao criar usuário' });
  }
};

export const listUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ fullName: 1 });
    res.json(users);
  } catch (error: any) {
    logger.error('[listUsers]', error.message);
    res.status(400).json({ error: 'Erro ao listar usuários' });
  }
};

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (error: any) {
    logger.error('[getUser]', error.message);
    res.status(400).json({ error: 'Erro ao buscar usuário' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (error: any) {
    logger.error('[updateUser]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar usuário' });
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 5) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 5 caracteres' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error: any) {
    logger.error('[resetUserPassword]', error.message);
    res.status(400).json({ error: 'Erro ao redefinir senha' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário removido' });
  } catch (error: any) {
    logger.error('[deleteUser]', error.message);
    res.status(400).json({ error: 'Erro ao remover usuário' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, department, cargo, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullName, email, department, cargo, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (error: any) {
    logger.error('[updateProfile]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar perfil' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Senha atual incorreta' });

    if (newPassword.length < 5) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 5 caracteres' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error: any) {
    logger.error('[updatePassword]', error.message);
    res.status(400).json({ error: 'Erro ao alterar senha' });
  }
};
