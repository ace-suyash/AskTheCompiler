import Notification from '../models/Notification.models.js';

export const createNotification = async ({ recipient, sender, type, questionId, messageThreadUserId }) => {
  if (recipient.toString() === sender.toString()) return null;

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    questionId: questionId || null,
    messageThreadUserId: messageThreadUserId || null,
  });

  return notification;
};
