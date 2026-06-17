import mongoose, { Schema } from 'mongoose';

const questionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      minlength: [7, 'Title must be at least 7 characters — be specific'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },

    body: {
      type: String,
      required: [true, 'Question body is required'],
      minlength: [20, 'Please describe your question in more detail (min 20 characters)'],
    },

    tags: {
      type: [String],
      required: [true, 'At least one tag is required'],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 5,
        message: 'Questions must have between 1 and 5 tags',
      },
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

    views: {
      type: Number,
      default: 0,
    },

    acceptedAnswer: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      default: null,
    },

    status: {
      type: String,
      enum: ['active', 'under_review', 'closed', 'removed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtuals
questionSchema.virtual('score').get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// Indexes
questionSchema.index(
  { title: 'text', body: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, body: 1 }, name: 'question_text_search' }
);

questionSchema.index({ tags: 1 });

questionSchema.index({ createdAt: -1 });

questionSchema.index({ author: 1, createdAt: -1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
