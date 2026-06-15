import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message cannot be empty'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

messageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
messageSchema.index({ recipient: 1, sender: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
