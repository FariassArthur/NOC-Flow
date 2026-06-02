import mongoose from 'mongoose';
import type { Occurrence } from '@noc/shared';

const occurrenceSchema = new mongoose.Schema<Occurrence>(
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
      enum: ['aberta', 'em_andamento', 'pausada', 'fechada'],
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

export const Occurrence = mongoose.model<Occurrence>('Occurrence', occurrenceSchema);
