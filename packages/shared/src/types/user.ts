import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId | string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  department: string;
  role: 'viewer' | 'analyst' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  token: string;
  expiresIn: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;
