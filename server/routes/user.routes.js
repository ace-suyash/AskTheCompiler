import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authMiddleware, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:username', optionalAuth, userController.getProfile);

router.delete('/me', authMiddleware, userController.deleteAccount);

export default router;
