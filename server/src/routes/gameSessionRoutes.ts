import express from 'express';
import {
  startGameSession,
  getGameState,
  postGameAction,
} from '../controllers/gameSessionController';

const router = express.Router();

// Start a new game session from a published game
router.post('/session/start/:id', startGameSession);

// Get current game state for a session
router.get('/session/:id/state', getGameState);

// Post a game action (play card, draw, etc.)
router.post('/session/:id/action', postGameAction);

export default router;
