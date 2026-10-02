import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// In-memory denylist: use shared storage (for example Redis) across production instances.
// Steps to use redis:
// 1. Install redis and ioredis: npm install redis ioredis
// 2. Create a Redis client: const redisClient = new Redis(config.redisUrl);
// 3. Replace revokedTokens Map with Redis commands:
//    - To revoke a token: await redisClient.set(tokenId, 'revoked', 'EX', expiresInSeconds);
//    - To check if a token is revoked: const isRevoked = await redisClient.exists(tokenId);
// 4. Make sure to handle Redis connection errors and retries in production.
const revokedTokens = new Map();

export function isTokenRevoked(tokenId) {
  const expiresAt = revokedTokens.get(tokenId);
  if (!expiresAt) return false;
  if (expiresAt <= Date.now()) {
    revokedTokens.delete(tokenId);
    return false;
  }
  return true;
}

function generateToken(userId) {
// syntax of jwt.sign(payload, secretOrPrivateKey, [options, callback])
  return jwt.sign({ userId }, config.jwtSecret, {
    jwtid: randomUUID(),
    expiresIn: config.jwtExpiresIn,
  });
}

// POST /api/v1/users — Register
export async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const user = await User.create({ email, password });

    res.status(201).json({
      id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/sessions — Login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      token,
      tokenType: 'Bearer',
      expiresIn: config.jwtExpiresIn,
    });
  } catch (error) {
    next(error); // what is next(error) doing here? 
    // The next(error) function is used to pass the error to the next middleware in the Express.js stack,
    //  which is typically an error-handling middleware.
    
    // In this context, if an error occurs during the login process (e.g., user not found, password mismatch), calling next(error) will forward the error to the error handler,
    //  allowing it to generate an appropriate HTTP response for the client.
    // How error is handled in the error handler middleware?
    //  The error handler middleware checks the type of error and responds with an appropriate HTTP status code and message.
  }
}

// DELETE /api/v1/sessions/current — Logout
export async function logout(req, res) {
  const authorization = req.get('Authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (match) {
    try {
      const payload = jwt.verify(match[1], config.jwtSecret);
      if (payload.jti && payload.exp) {
        revokedTokens.set(payload.jti, payload.exp * 1000);
      }
    } catch {
      // Keep logout idempotent for missing, invalid, or expired tokens.
    }
  }

  res.set('Cache-Control', 'no-store');
  res.status(204).send();
}

// GET /api/v1/users/me — Get current user
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
}