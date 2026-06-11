import mongoose, { Document, Schema } from 'mongoose';

export interface IReportSchedule extends Document {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'csv' | 'pdf';
  filters?: Record<string, string>;
  recipients: string[];
  createdBy: string;
  active: boolean;
  lastRunAt?: Date;
}

const ReportScheduleSchema = new Schema<IReportSchedule>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    format: {
      type: String,
      enum: ['csv', 'pdf'],
      default: 'csv',
    },
    filters: { type: Schema.Types.Mixed },
    recipients: [{ type: String }],
    createdBy: { type: String, required: true },
    active: { type: Boolean, default: true },
    lastRunAt: { type: Date },
  },
  { timestamps: true }
);

export const ReportSchedule = mongoose.model<IReportSchedule>(
  'ReportSchedule',
  ReportScheduleSchema
);
