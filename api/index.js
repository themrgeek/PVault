import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from '../src/config/db.js';
import authRoutes from '../src/routes/auth.routes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'https://api.pvault.com/problems/rate-limit',
    title: 'Too Many Requests',
    status: 429,
  },
});

// Connect to MongoDB
await connectDB();

// Routes
app.use('/api/v1', authLimiter, authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    type: 'https://api.pvault.com/problems/not-found',
    title: 'Not Found',
    status: 404,
    instance: req.originalUrl,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;