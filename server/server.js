import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { initCloudinary } from './config/cloudinary.js';

import authRoutes from './routes/auth.routes.js';
import questionRoutes from './routes/question.routes.js';
import answerRoutes from './routes/answer.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import { cleanupUnverifiedUsers } from './jobs/cleanupUnverifiedUsers.js';

dotenv.config();
initCloudinary();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\nAskTheCompiler API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
// 24 hrs by default
  const cleanupIntervalMs = Number(process.env.CLEANUP_INTERVAL_MS) || 24 * 60 * 60 * 1000;
  if (cleanupIntervalMs > 0) {
    cleanupUnverifiedUsers().catch((err) =>
      console.error('[cleanup] Initial sweep failed:', err)
    );
    setInterval(() => {
      cleanupUnverifiedUsers().catch((err) =>
        console.error('[cleanup] Scheduled sweep failed:', err)
      );
    }, cleanupIntervalMs);
  }
});
