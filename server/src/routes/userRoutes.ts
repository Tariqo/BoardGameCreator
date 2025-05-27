import express from 'express';
import {
  getProfile,
  updateProfile,
  getMe,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// ✅ Apply authentication to all user routes
router.use(authenticateToken);

// ✅ Return full user session info (used on refresh)
router.get('/me', getMe);

// ✅ Get user profile (custom view/edit profile)
router.get('/profile', getProfile);

// ✅ Update user profile info
router.put('/profile', updateProfile);

export default router;
