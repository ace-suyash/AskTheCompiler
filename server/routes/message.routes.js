
import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', messageController.getInbox);
router.get('/:userId', messageController.getConversation);
router.post('/:userId', messageController.sendMessage);

export default router;
