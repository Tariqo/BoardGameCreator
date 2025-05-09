import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

export default router; 