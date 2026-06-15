import mongoose, { Schema } from 'mongoose';

const answerSchema = new Schema(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },

    body: {
      type: String,
      required: [true, 'Answer body is required'],
      minlength: [20, 'Answer must be at least 20 characters'],
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],

    downvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    isAccepted: {
      type: Boolean,
      default: false,
    },

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtuals
answerSchema.virtual('score').get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// index
answerSchema.index({ question: 1, createdAt: -1 });

answerSchema.index({ author: 1, createdAt: -1 });

const Answer = mongoose.model('Answer', answerSchema);
export default Answer;
