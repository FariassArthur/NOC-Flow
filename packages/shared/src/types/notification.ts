import { ObjectId } from 'mongodb';

export type NotificationType = 'new_occurrence' | 'status_change' | 'assignment' | 'comment';

export interface Notification {
  _id?: ObjectId | string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedOccurrence?: string;
  read: boolean;
  createdAt: Date;
}
