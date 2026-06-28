import * as questionService from '../services/question.service.js';
import Question from '../models/Question.models.js';
import { createNotification } from '../utils/createNotification.js';

export const createQuestion = async (req, res, next) => {
  try {
    const { title, body, tags } = req.body;
    const question = await questionService.createQuestion({
      title,
      body,
      tags,
      authorId: req.user._id,
    });
    res.status(201).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

export const getAllQuestions = async (req, res, next) => {
  try {
    const { search, tag, sort, page, limit } = req.query;
    const result = await questionService.getAllQuestions({
      search,
      tag,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req, res, next) => {
  try {
    const question = await questionService.getQuestionById(req.params.id, req.user?._id);
    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

export const voteQuestion = async (req, res, next) => {
  try {
    const { voteType } = req.body;
    const question = await questionService.voteQuestion(
      req.params.id,
      req.user._id,
      voteType
    );

    if (voteType === 'up') {
      const questionDoc = await Question.findById(req.params.id).select('author');
      if (questionDoc) {
        await createNotification({
          recipient: questionDoc.author,
          sender: req.user._id,
          type: 'vote',
          questionId: req.params.id,
        });
      }
    }

    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id; 

    const question = await questionService.deleteQuestion(questionId, userId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Question successfully deleted',
      question 
    });
  } catch (error) {
    next(error);
  }
};