import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import authRoutes from './routes/auth.js';
import classRoutes from './routes/classes.js';
import quizRoutes from './routes/quizzes.js';
import assignmentRoutes from './routes/assignments.js';
import aiRoutes from './routes/ai.js';
import analyticsRoutes from './routes/analytics.js';
import groupRoutes from './routes/groups.js';
import adminRoutes from './routes/admin.js';
import { serveUploads } from './middleware/upload.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests' } });
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: 'Too many auth attempts' } });
app.use('/api/auth', authLimiter);
app.use('/api', limiter);

// Routes
app.get('/uploads/:file', serveUploads);

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/admin', adminRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'school-genesis' }));

// Connect DB then start
async function start() {
  let uri = process.env.MONGO_URI;

  if (!uri || uri === 'memory') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.join(__dirname, 'data');
    const mongod = await MongoMemoryServer.create({
      instance: { port: 27017, dbName: 'school-genesis', dbPath },
    });
    uri = mongod.getUri();
    console.log('MongoDB persistent server started (data survives restarts)');
  }

  try {
    await mongoose.connect(uri);
    const { seedDatabase } = await import('./seed.js');
    await seedDatabase();
    console.log(`School Genesis API running on port ${PORT}`);
  } catch (err) {
    console.error('Failed to start:', err.message);
  }
  app.listen(PORT);
}

start();
