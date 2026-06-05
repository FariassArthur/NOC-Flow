import mongoose from 'mongoose';
import type { Notification as NotificationType } from '@noc/shared';

const notificationSchema = new mongoose.Schema<NotificationType>(
  {
    recipient: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['new_occurrence', 'status_change', 'assignment', 'comment', 'escalation'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedOccurrence: {
      type: String,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.post('save', function (doc) {
  import('../services/socketManager').then(({ emitToUser }) => {
    emitToUser(doc.recipient, 'notification', doc.toObject());
  }).catch(() => {});
});

notificationSchema.post('insertMany', function (docs: any[]) {
  import('../services/socketManager').then(({ emitToUser }) => {
    for (const doc of docs) {
      emitToUser(doc.recipient, 'notification', doc.toObject());
    }
  }).catch(() => {});
});

export const Notification = mongoose.model<NotificationType>('Notification', notificationSchema);
