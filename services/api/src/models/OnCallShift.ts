import mongoose, { Document, Schema } from 'mongoose';

export interface IOnCallShift extends Document {
  name: string;
  description?: string;
  department: string;
  weekDays: string[];
  startTime: string;
  endTime: string;
  userIds: string[];
  isActive: boolean;
}

const OnCallShiftSchema = new Schema<IOnCallShift>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    department: { type: String, required: true },
    weekDays: { type: [String], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    userIds: [{ type: String, ref: 'User' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const OnCallShift = mongoose.model<IOnCallShift>('OnCallShift', OnCallShiftSchema);
