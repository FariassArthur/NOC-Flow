import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import type { AuthRequest } from '../middleware/auth';

export const listUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ fullName: 1 });
    res.json(users);
  } catch (error: any) {
    console.error('[listUsers]', error.message);
    res.status(400).json({ error: 'Erro ao listar usuários' });
  }
};

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (error: any) {
    console.error('[getUser]', error.message);
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
    console.error('[updateUser]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar usuário' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário removido' });
  } catch (error: any) {
    console.error('[deleteUser]', error.message);
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
    console.error('[updateProfile]', error.message);
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
    console.error('[updatePassword]', error.message);
    res.status(400).json({ error: 'Erro ao alterar senha' });
  }
};
