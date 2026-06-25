
import * as messageService from '../services/message.service.js';
import { createNotification } from '../utils/createNotification.js';

export const getInbox = async (req, res, next) => {
  try {
    const conversations = await messageService.getInbox(req.user._id);
    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const result = await messageService.getConversation(req.user._id, req.params.userId);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const message = await messageService.sendMessage({
      senderId: req.user._id,
      recipientId: req.params.userId,
      content,
    });

    await createNotification({
      recipient: req.params.userId,
      sender: req.user._id,
      type: 'message',
      messageThreadUserId: req.user._id,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
