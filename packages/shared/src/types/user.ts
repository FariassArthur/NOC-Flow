export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  department: string;
  cargo: string;
  role: 'viewer' | 'analyst' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  token: string;
  expiresIn: string | number;
}

export type UserWithoutPassword = Omit<User, 'password'>;
