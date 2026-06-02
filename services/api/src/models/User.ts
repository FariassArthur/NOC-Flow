import mongoose from 'mongoose';
import type { User as UserType } from '@noc/shared';

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
    avatar: String,
  },
  { timestamps: true }
);

export const User = mongoose.model<UserType>('User', userSchema);
