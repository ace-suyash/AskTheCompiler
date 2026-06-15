import User from '../models/User.models.js';
import Question from '../models/Question.models.js';
import Answer from '../models/Answer.models.js';
import { ApiError } from '../utils/ApiError.js';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new ApiError(404, 'User not found');

  const questions = await Question.find({ author: userId })
    .select('title tags upvotes downvotes views acceptedAnswer createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const answers = await Answer.find({ author: userId })
    .populate('question', 'title')
    .select('body question upvotes downvotes isAccepted createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const totalViews = questions.reduce((sum, q) => sum + (q.views || 0), 0);

  const totalUpvotes =
    questions.reduce((sum, q) => sum + q.upvotes.length, 0) +
    answers.reduce((sum, a) => sum + a.upvotes.length, 0);

  const totalDownvotes =
    questions.reduce((sum, q) => sum + q.downvotes.length, 0) +
    answers.reduce((sum, a) => sum + a.downvotes.length, 0);

  const acceptedAnswersCount = answers.filter(a => a.isAccepted).length;

  const questionsWithScore = questions.map(q => ({
    ...q,
    score: q.upvotes.length - q.downvotes.length,
    hasAcceptedAnswer: !!q.acceptedAnswer,
  }));

  const answersWithScore = answers.map(a => ({
    ...a,
    score: a.upvotes.length - a.downvotes.length,
    bodyPreview: a.body.replace(/```[\s\S]*?```/g, '[code]').slice(0, 150),
  }));

  return {
    user,
    stats: {
      totalQuestions: questions.length,
      totalAnswers: answers.length,
      totalViews,
      totalUpvotes,
      totalDownvotes,
      netScore: totalUpvotes - totalDownvotes,
      acceptedAnswersCount,
    },
    questions: questionsWithScore,
    answers: answersWithScore,
  };
};


export const deleteUserAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');


  // a ghost user is created to take ownership of the deleted user's content
  // ensuring that questions and answers remain accessible while indicating that the original author has been deleted
  let deletedUser = await User.findOne({ username: 'deleted_user' });
  if (!deletedUser) {
    deletedUser = await User.create({
      username: 'deleted_user',
      email: `deleted_user_${Date.now()}@askthecompiler.local`,
      password: Math.random().toString(36).slice(2) + Date.now(),
      bio: 'This account has been deleted.',
    });
  }

  await Question.updateMany({ author: userId }, { author: deletedUser._id });
  await Answer.updateMany({ author: userId }, { author: deletedUser._id });

  await Question.updateMany({}, { $pull: { upvotes: userId, downvotes: userId } });
  await Answer.updateMany({}, { $pull: { upvotes: userId, downvotes: userId } });

  await User.findByIdAndDelete(userId);

  return { message: 'Account deleted successfully' };
};
