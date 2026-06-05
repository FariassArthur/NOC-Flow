import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  slaResponseMinutes?: number;
  slaResolutionMinutes?: number;
  color?: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    slaResponseMinutes: { type: Number },
    slaResolutionMinutes: { type: Number },
    color: { type: String, default: '#6366f1' },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
