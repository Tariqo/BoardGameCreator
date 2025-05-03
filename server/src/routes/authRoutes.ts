import express, { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter';

const router: Router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

export default router; 