import mongoose from 'mongoose';
import type { RunbookExecution as RunbookExecutionType } from '@ccore/shared';

const stepExecutionSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending',
    },
    completedAt: Date,
    completedBy: String,
    notes: String,
  },
  { _id: false }
);

const runbookExecutionSchema = new mongoose.Schema<RunbookExecutionType>(
  {
    runbookId: { type: String, required: true, index: true },
    runbookTitle: { type: String, required: true },
    occurrenceId: { type: String, index: true },
    startedBy: { type: String, required: true },
    startedByName: String,
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    status: {
      type: String,
      enum: ['running', 'completed', 'cancelled'],
      default: 'running',
    },
    steps: [stepExecutionSchema],
    currentStep: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

export const RunbookExecution = mongoose.model<RunbookExecutionType>(
  'RunbookExecution',
  runbookExecutionSchema
);
