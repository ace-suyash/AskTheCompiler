import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../services/upload.service.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = Router();

router.post('/', authMiddleware, upload.single('image'), uploadImage);

export default router;
