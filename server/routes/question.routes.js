
import { Router } from 'express';
import * as questionController from '../controllers/question.controller.js';
import { authMiddleware, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', questionController.getAllQuestions);
router.get('/:id', optionalAuth, questionController.getQuestionById);

router.post('/', authMiddleware, questionController.createQuestion);
router.post('/:id/vote', authMiddleware, questionController.voteQuestion);

router.delete('/:id', authMiddleware, questionController.deleteQuestion);

export default router;
