import express from 'express';
import {
  getProfile,
  updateProfile,
  getMe,
} from '../controllers/userController';
import { authenticateToken, attachUser } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.use(attachUser);

router.get('/me', getMe);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
