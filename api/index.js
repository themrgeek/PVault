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
// What is helmet cors and express.json doing here?
// Helmet is a middleware that helps secure Express apps by setting various HTTP headers to protect against common web vulnerabilities. 
// It enhances the security of the application by adding headers like Content Security Policy, X-Frame-Options, and others.
// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'https://api.pvault.com/problems/too-many-requests', // what is this api/pvault.com/problems/too-many-requests?
    // This URL is a reference to a problem type in the API. It follows the Problem Details for HTTP APIs specification (RFC 7807), which provides a standardized way to convey error information in HTTP responses.
    //  The URL serves as a unique identifier for the specific type of error (in this case, too many requests) and can be used by clients to understand the nature of the error and how to handle it.
    // Can I require to buy domain api.pvault.com to use this? No, you do not need to buy the domain api.pvault.com to use this. The URL is just a reference to a problem type in the API and does not require ownership of the domain. It is used for documentation purposes and to provide a standardized way to convey error information in HTTP responses.
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