import mongoose from 'mongoose';
import type { Occurrence as OccurrenceType } from '@noc/shared';

type OccurrenceSchema = Omit<OccurrenceType, 'createdBy' | 'assignedTo' | 'resolvidoPor'> & {
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  resolvidoPor?: mongoose.Types.ObjectId;
  comments: Array<{
    author: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  history: Array<{
    field: string;
    oldValue: string;
    newValue: string;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
  }>;
};

const occurrenceSchema = new mongoose.Schema<OccurrenceSchema>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['aberta', 'em_execucao', 'finalizada'],
      default: 'aberta',
    },
    priority: {
      type: String,
      enum: ['baixa', 'média', 'alta', 'crítica'],
      default: 'média',
    },
    tags: [String],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: Date,
    timeSpentMinutes: {
      type: Number,
      default: 0,
    },
    resolucao: String,
    resolvidoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvidoEm: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    history: [
      {
        field: String,
        oldValue: String,
        newValue: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Occurrence = mongoose.model<OccurrenceSchema>('Occurrence', occurrenceSchema);
