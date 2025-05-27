import express from 'express';
import { savePublishedGame, getMyGames  } from '../controllers/publishedGameController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Optional: only allow authenticated users
router.post('/publish', authenticateToken, savePublishedGame);
router.get('/my', authenticateToken, getMyGames);

export default router;
