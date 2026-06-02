import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { loginSchema, userSchema } from '@noc/shared';

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

    res.json({
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const data = userSchema.parse(req.body);

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });
    if (existingUser) {
      const field = existingUser.email === data.email ? 'Email' : 'Usuário';
      return res.status(409).json({ error: `${field} já está em uso` });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      ...data,
      password: hashedPassword,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select('-password');
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
