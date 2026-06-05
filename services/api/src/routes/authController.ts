import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { loginSchema, userRegisterSchema, userNocSchema } from '@noc/shared';
import { logAudit } from '../middleware/audit';

export const login = async (req: Request, res: Response) => {
  try {
    const { login: loginOrEmail, password } = loginSchema.parse(req.body);

    const user = await User.findOne({
      $or: [
        { email: loginOrEmail.toLowerCase() },
        { username: loginOrEmail.toLowerCase() },
      ],
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());

    logAudit(req as AuthRequest, {
      action: 'login',
      targetId: user._id.toString(),
      targetType: 'user',
      details: `Login: ${user.username}`,
    });

    res.json({
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  } catch (error: any) {
    console.error('[login]', error.message);
    res.status(400).json({ error: 'Erro ao fazer login' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const data = userRegisterSchema.parse(req.body);

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });
    if (existingUser) {
      const field = existingUser.email === data.email ? 'Email' : 'Usuário';
      return res.status(409).json({ error: `${field} já está em uso` });
    }

    const user = await User.create({
      ...data,
    });

    const token = generateToken(user._id.toString());

    logAudit(req as AuthRequest, {
      action: 'register',
      targetId: user._id.toString(),
      targetType: 'user',
      details: `Registro: ${user.username} (${user.department})`,
    });

    res.status(201).json({
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  } catch (error: any) {
    console.error('[register]', error.message);
    res.status(400).json({ error: 'Erro ao registrar' });
  }
};

export const registerNoc = async (req: AuthRequest, res: Response) => {
  try {
    const data = userNocSchema.parse(req.body);

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });
    if (existingUser) {
      const field = existingUser.email === data.email ? 'Email' : 'Usuário';
      return res.status(409).json({ error: `${field} já está em uso` });
    }

    const user = await User.create({
      ...data,
    });

    const token = generateToken(user._id.toString());

    logAudit(req, {
      action: 'create_user',
      targetId: user._id.toString(),
      targetType: 'user',
      details: `Admin criou usuário NOC: ${user.username}`,
    });

    res.status(201).json({
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        department: user.department,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[registerNoc]', error.message);
    res.status(400).json({ error: 'Erro ao registrar usuário NOC' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (error: any) {
    console.error('[getMe]', error.message);
    res.status(400).json({ error: 'Erro ao buscar usuário' });
  }
};
