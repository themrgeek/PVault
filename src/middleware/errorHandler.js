import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err, req, res, next) {
  // Handle known operational errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      type: err.type,
      title: err.message,
      status: err.statusCode,
      instance: req.originalUrl,
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      type: 'https://api.pvault.com/problems/conflict',
      title: 'Email already exists',
      status: 409,
      instance: req.originalUrl,
    });
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      type: 'https://api.pvault.com/problems/validation-error',
      title: 'Validation Error',
      status: 400,
      detail: messages.join(', '),
      instance: req.originalUrl,
    });
  }

  // Unknown errors
  console.error('UNHANDLED ERROR:', err);
  return res.status(500).json({
    type: 'https://api.pvault.com/problems/internal-error',
    title: 'Internal Server Error',
    status: 500,
    instance: req.originalUrl,
  });
}