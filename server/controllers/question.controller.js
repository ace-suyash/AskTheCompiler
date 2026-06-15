import * as questionService from '../services/question.service.js';

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
    const question = await questionService.getQuestionById(req.params.id);
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
    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};
