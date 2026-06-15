import Message from '../models/Message.models.js';
import User from '../models/User.models.js';
import { ApiError } from '../utils/ApiError.js';

export const sendMessage = async ({ senderId, recipientId, content }) => {
  if (senderId.toString() === recipientId.toString()) {
    throw new ApiError(400, 'You cannot message yourself');
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) throw new ApiError(404, 'User not found');

  const message = await Message.create({
    sender: senderId,
    recipient: recipientId,
    content,
  });

  return message.populate('sender', 'username profilePic');
};


export const getConversation = async (userId, otherUserId) => {
  const otherUser = await User.findById(otherUserId).select('username profilePic');
  if (!otherUser) throw new ApiError(404, 'User not found');

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .lean();

  return { otherUser, messages };
};

export const getInbox = async (userId) => {
  const messages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }],
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'username profilePic')
    .populate('recipient', 'username profilePic')
    .lean();

  const conversations = new Map();
  for (const msg of messages) {
    const isSentByMe = msg.sender._id.toString() === userId.toString();
    const other = isSentByMe ? msg.recipient : msg.sender;
    const key = other._id.toString();

    if (!conversations.has(key)) {
      conversations.set(key, {
        user: other,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        lastMessageWasMine: isSentByMe,
      });
    }
  }

  return Array.from(conversations.values());
};
