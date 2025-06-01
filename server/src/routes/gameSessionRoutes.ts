import express from 'express';
import {
  startGameSession,
  getGameState,
  postGameAction,
  joinGameSession,
} from '../controllers/gameSessionController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Start a new game session from a published game
router.post('/session/start/:id', authenticateToken, startGameSession);

// Get current game state for a session
router.get('/session/:id/state', getGameState); // Guests can fetch state before trying to join

// Post a game action
router.post('/session/:id/action', authenticateToken, postGameAction);

// Join a game session
router.post('/session/:sessionId/join', authenticateToken, joinGameSession);

export default router;
