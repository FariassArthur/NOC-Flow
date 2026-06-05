import { Notification } from '../models/Notification';
import { emitToUser } from './socketManager';

interface CreateNotificationParams {
  recipient: string;
  type: string;
  title: string;
  message: string;
  relatedOccurrence?: string;
}

export const createAndNotify = async (params: CreateNotificationParams) => {
  const notification = await Notification.create({
    recipient: params.recipient,
    type: params.type,
    title: params.title,
    message: params.message,
    relatedOccurrence: params.relatedOccurrence,
    read: false,
  });

  emitToUser(params.recipient, 'notification', notification.toObject());

  return notification;
};

export const createAndNotifyMany = async (paramsArray: CreateNotificationParams[]) => {
  const notifications = await Notification.insertMany(
    paramsArray.map((p) => ({
      recipient: p.recipient,
      type: p.type,
      title: p.title,
      message: p.message,
      relatedOccurrence: p.relatedOccurrence,
      read: false,
    }))
  );

  notifications.forEach((n, i) => {
    emitToUser(paramsArray[i].recipient, 'notification', n.toObject());
  });

  return notifications;
};
