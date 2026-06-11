import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  title: string;
  description?: string;
  priority?: string;
  checklist?: string[];
  category?: string;
  service?: string;
  equipment?: string;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    description: { type: String, trim: true },
    priority: { type: String },
    checklist: { type: [String], default: [] },
    category: { type: String },
    service: { type: String },
    equipment: { type: String },
  },
  { timestamps: true }
);

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
