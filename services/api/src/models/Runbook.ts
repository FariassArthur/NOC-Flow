import mongoose, { Document, Schema } from 'mongoose';

export interface IRunbook extends Document {
  title: string;
  category?: mongoose.Types.ObjectId;
  priority?: string;
  steps: { order: number; description: string }[];
  tags?: string[];
}

const RunbookSchema = new Schema<IRunbook>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    priority: { type: String, trim: true },
    steps: [
      {
        order: { type: Number, required: true },
        description: { type: String, required: true },
      },
    ],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Runbook = mongoose.model<IRunbook>('Runbook', RunbookSchema);
