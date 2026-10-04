import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  register,
  login,
  logout,
  getMe,
} from '../controllers/auth.controllers.js';
import {
  backupMyAuthData,
  deleteMyAuthLogs,
  exportMyAuthLogs,
  getMyAuthLogs,
} from '../controllers/authLogs.controllers.js';

const router = Router();

// Auth endpoints
router.post('/users', register);           // Register
router.post('/sessions', login);           // Login
// what is authenticate in router.delete('/sessions/current', authenticate, logout); // Logout
// The authenticate function is a middleware that checks if the user is authenticated before allowing access to the logout route. 
// It verifies the JWT token provided in the request headers.
//  If the token is valid, it allows the request to proceed to the logout controller; otherwise, it responds with an authentication error.
router.delete('/sessions/current', authenticate, logout); // Logout
router.get('/users/me', authenticate, getMe); // Get current user
router.get('/auth-logs', authenticate, getMyAuthLogs);
router.delete('/auth-logs', authenticate, deleteMyAuthLogs);
router.get('/auth-logs/export', authenticate, exportMyAuthLogs);
router.get('/auth-logs/backup', authenticate, backupMyAuthData);

export default router;