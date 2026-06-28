import Answer from '../models/Answer.models.js';
import Question from '../models/Question.models.js';
import User from '../models/User.models.js';
import { ApiError } from '../utils/ApiError.js';
import { cloudinary } from '../config/cloudinary.js';

export const getAnswersForQuestion = async (questionId) => {
  const answers = await Answer.find({ question: questionId })
    .populate('author', 'username profilePic reputation')
    .populate({ path: 'replyTo', select: 'author', populate: { path: 'author', select: 'username' } })
    .lean();

  return answers.sort((a, b) => {
    if (a.isAccepted) return -1;
    if (b.isAccepted) return 1;
    const scoreA = a.upvotes.length - a.downvotes.length;
    const scoreB = b.upvotes.length - b.downvotes.length;
    return scoreB - scoreA;
  });
};

export const addAnswer = async ({ questionId, body, authorId, replyTo = null }) => {
  const question = await Question.findById(questionId);
  if (!question) throw new ApiError(404, 'Question not found');
  if (question.status !== 'active') throw new ApiError(400, 'This question is closed for answers');

  if (replyTo) {
    const parentAnswer = await Answer.findById(replyTo);
    if (!parentAnswer) throw new ApiError(404, 'The answer you are replying to no longer exists');
    if (parentAnswer.question.toString() !== questionId.toString()) {
      throw new ApiError(400, 'Cannot reply to an answer from a different question');
    }
    if (parentAnswer.replyTo) {
      throw new ApiError(400, 'Cannot reply to a reply — only one level of tagging is allowed');
    }
  }

  const answer = await Answer.create({
    question: questionId,
    body,
    author: authorId,
    replyTo,
  });

  const populatedAnswer = await answer.populate([
    { path: 'author', select: 'username profilePic reputation' },
    { path: 'replyTo', select: 'author', populate: { path: 'author', select: 'username' } },
  ]);

  return populatedAnswer;
};

export const voteAnswer = async (answerId, userId, voteType) => {
  const answer = await Answer.findById(answerId);
  if (!answer) throw new ApiError(404, 'Answer not found');

  if (answer.author.toString() === userId.toString()) {
    throw new ApiError(403, 'You cannot vote on your own answer');
  }

  const upIndex = answer.upvotes.indexOf(userId);
  const downIndex = answer.downvotes.indexOf(userId);

  if (voteType === 'up') {
    if (upIndex > -1) {
      answer.upvotes.splice(upIndex, 1);
    } else {
      answer.upvotes.push(userId);
      if (downIndex > -1) answer.downvotes.splice(downIndex, 1);
    }
  } else if (voteType === 'down') {
    if (downIndex > -1) {
      answer.downvotes.splice(downIndex, 1);
    } else {
      answer.downvotes.push(userId);
      if (upIndex > -1) answer.upvotes.splice(upIndex, 1);
    }
  }

  await answer.save();
  return answer.populate('author', 'username profilePic reputation');
};

export const acceptAnswer = async (answerId, requestingUserId) => {
  const answer = await Answer.findById(answerId);
  if (!answer) throw new ApiError(404, 'Answer not found');

  const question = await Question.findById(answer.question);
  if (!question) throw new ApiError(404, 'Parent question not found');

  if (question.author.toString() !== requestingUserId.toString()) {
    throw new ApiError(403, 'Only the question author can accept an answer');
  }

  if (answer.isAccepted) {
    answer.isAccepted = false;
    question.acceptedAnswer = null;
  } else {
    await Answer.updateMany(
      { question: answer.question, isAccepted: true },
      { $set: { isAccepted: false } }
    );

    answer.isAccepted = true;
    question.acceptedAnswer = answer._id;
  }

  await Promise.all([answer.save(), question.save()]);
  return answer;
};

const extractCloudinaryPublicId = (url) => {
  try {
    const parts = url.split('/upload/');
    if (parts.length !== 2) return null;

    let pathStr = parts[1];

    if (pathStr.match(/^v\d+\//)) {
      pathStr = pathStr.replace(/^v\d+\//, '');
    }

    const publicId = pathStr.split('.').slice(0, -1).join('.');

    return publicId;
  } catch (error) {
    console.error('Failed to extract public_id:', error);
    return null;
  }
};

export const deleteAnswer = async (answerId, userId) => {
  const answer = await Answer.findById(answerId);
  if (!answer) {
    throw new ApiError(404, 'Answer not found');
  }
  if (answer.author.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this answer');
  }

  let dummyUser = await User.findOne({ username: 'deleted_user' });
  if (!dummyUser) {
    dummyUser = await User.create({
      username: 'deleted_user',
      email: `deleted_user_${Date.now()}@askthecompiler.local`,
      password: Math.random().toString(36).slice(2) + Date.now(),
      bio: 'This account has been deleted.',
      isVerified: true,
    });
  }

  if (answer.replyTo) {
    await Answer.findByIdAndDelete(answerId);
    return { deleted: true };
  }

  const deletedMessage = '[Answer has been deleted by the user]';
  answer.body = deletedMessage;
  answer.author = dummyUser._id;
  await answer.save();

  return answer.populate('author', 'username profilePic reputation');
};
