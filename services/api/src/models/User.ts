import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import type { User as UserType } from '@ccore/shared';

const userSchema = new mongoose.Schema<UserType>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    cargo: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['viewer', 'analyst', 'admin'],
      default: 'analyst',
    },
    permissions: {
      type: [String],
      default: [],
    },
    avatar: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const User = mongoose.model<UserType>('User', userSchema);
