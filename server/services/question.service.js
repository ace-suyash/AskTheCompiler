import Question from '../models/Question.models.js';
import { ApiError } from '../utils/ApiError.js';
import { isOnTopic } from './moderation.service.js';


export const createQuestion = async ({ title, body, tags, authorId }) => {
  const moderation = isOnTopic(title, body);
  if (!moderation.allowed) {
    throw new ApiError(
      422,
      'Your question does not appear to be about programming or software development. ' +
      'AskTheCompiler is for technical questions only. ' +
      'Please include relevant code, error messages, or technical context.'
    );
  }

  const normalisedTags = [...new Set(tags.map(t => t.toLowerCase().trim()))];

  const question = await Question.create({
    title: title.trim(),
    body,
    tags: normalisedTags,
    author: authorId,
  });

  return question.populate('author', 'username profilePic reputation');
};

export const getAllQuestions = async ({
  search = '',
  tag = '',
  sort = 'newest',
  page = 1,
  limit = 15,
}) => {
  const query = { status: 'active' };

  if (search) {
    query.$text = { $search: search };
  }
  if (tag) {
    query.tags = { $in: [tag.toLowerCase()] };
  }
  let sortOption = {};
  if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'votes') sortOption = { 'upvotes.length': -1 }; 
  else if (sort === 'unanswered') {
    query.acceptedAnswer = null;
    sortOption = { createdAt: -1 };
  }

  if (search) {
    sortOption = { score: { $meta: 'textScore' }, ...sortOption };
  }

  const skip = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    Question.find(query, search ? { score: { $meta: 'textScore' } } : {})
      .populate('author', 'username profilePic reputation')
      .populate('acceptedAnswer', '_id')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Question.countDocuments(query),
  ]);

  return {
    questions,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: skip + questions.length < total,
    },
  };
};

export const getQuestionById = async (questionId) => {
  const question = await Question.findByIdAndUpdate(
    questionId,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'username profilePic reputation bio')
    .populate('acceptedAnswer');

  if (!question) throw new ApiError(404, 'Question not found');
  return question;
};

export const voteQuestion = async (questionId, userId, voteType) => {
  const question = await Question.findById(questionId);
  if (!question) throw new ApiError(404, 'Question not found');

  if (question.author.toString() === userId.toString()) {
    throw new ApiError(403, 'You cannot vote on your own question');
  }

  const upIndex = question.upvotes.indexOf(userId);
  const downIndex = question.downvotes.indexOf(userId);

  if (voteType === 'up') {
    if (upIndex > -1) {
      question.upvotes.splice(upIndex, 1);
    } else {
      question.upvotes.push(userId);
      if (downIndex > -1) question.downvotes.splice(downIndex, 1);
    }
  } else if (voteType === 'down') {
    if (downIndex > -1) {
      question.downvotes.splice(downIndex, 1);
    } else {
      question.downvotes.push(userId);
      if (upIndex > -1) question.upvotes.splice(upIndex, 1);
    }
  }

  await question.save();

  return question.populate([
    { path: 'author', select: 'username profilePic reputation' },
    { path: 'acceptedAnswer' },
  ]);
};