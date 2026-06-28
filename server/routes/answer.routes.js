
import { Router } from 'express';
import * as answerController from '../controllers/answer.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/question/:questionId', answerController.getAnswersForQuestion);

router.post('/question/:questionId', authMiddleware, answerController.addAnswer);

router.post('/:id/vote', authMiddleware, answerController.voteAnswer);

router.post('/:id/accept', authMiddleware, answerController.acceptAnswer);

router.delete('/:id', authMiddleware, answerController.deleteAnswer);

export default router;
