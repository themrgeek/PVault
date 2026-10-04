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
      type: 'https://api.pvault.com/problems/conflict', // what is this api/pvault.com/problems/conflict?
      // This URL is a reference to a problem type in the API. It follows the Problem Details for HTTP APIs specification (RFC 7807), which provides a standardized way to convey error information in HTTP responses. The URL serves as a unique identifier for the specific type of error (in this case, a conflict due to a duplicate key) and can be used by clients to understand the nature of the error and how to handle it.
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