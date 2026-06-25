import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['message', 'reply', 'answer', 'vote'],
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    default: null,
  },
  messageThreadUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
