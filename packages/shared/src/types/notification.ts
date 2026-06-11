export type NotificationType =
  | 'new_occurrence'
  | 'status_change'
  | 'assignment'
  | 'comment'
  | 'escalation'
  | 'scheduled_report';

export interface Notification {
  _id?: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedOccurrence?: string;
  read: boolean;
  createdAt: Date;
}
