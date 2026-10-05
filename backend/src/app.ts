import express, { Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedData } from './seed.js';

const app = express();

app.use(cors());
app.use(express.json());

// Seed data on server initialization
seedData();

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Immverse Smart Task Manager API Server is running',
    timestamp: new Date().toISOString(),
    note: 'All data is stored in-memory and resets when server restarts.',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
