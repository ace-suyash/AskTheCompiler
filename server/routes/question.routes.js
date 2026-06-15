
import { Router } from 'express';
import * as questionController from '../controllers/question.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);

router.post('/', authMiddleware, questionController.createQuestion);
router.post('/:id/vote', authMiddleware, questionController.voteQuestion);
router.post('/:id/flag', authMiddleware, questionController.flagQuestion);

export default router;
