import * as answerService from '../services/answer.service.js';
import Question from '../models/Question.models.js';
import { createNotification } from '../utils/createNotification.js';

export const getAnswersForQuestion = async (req, res, next) => {
  try {
    const answers = await answerService.getAnswersForQuestion(req.params.questionId);
    res.json({ success: true, answers });
  } catch (error) {
    next(error);
  }
};

export const addAnswer = async (req, res, next) => {
  try {
    const { body, replyTo } = req.body;
    const answer = await answerService.addAnswer({
      questionId: req.params.questionId,
      body,
      authorId: req.user._id,
      replyTo: replyTo || null,
    });

    const question = await Question.findById(req.params.questionId).select('author');
    if (question) {
      await createNotification({
        recipient: question.author,
        sender: req.user._id,
        type: replyTo ? 'reply' : 'answer',
        questionId: req.params.questionId,
      });
    }

    res.status(201).json({ success: true, answer });
  } catch (error) {
    next(error);
  }
};

export const voteAnswer = async (req, res, next) => {
  try {
    const { voteType } = req.body;
    const answer = await answerService.voteAnswer(
      req.params.id,
      req.user._id,
      voteType
    );
    res.json({ success: true, answer });
  } catch (error) {
    next(error);
  }
};

export const acceptAnswer = async (req, res, next) => {
  try {
    const answer = await answerService.acceptAnswer(
      req.params.id,
      req.user._id
    );
    res.json({ success: true, answer });
  } catch (error) {
    next(error);
  }
};

export const deleteAnswer = async (req, res, next) => {
  try {
    const result = await answerService.deleteAnswer(req.params.id, req.user._id);
    if (result.deleted) {
      return res.status(200).json({ success: true, deleted: true, answerId: req.params.id });
    }
    res.status(200).json({ success: true, message: 'Answer successfully deleted', answer: result });
  } catch (error) {
    next(error);
  }
};
