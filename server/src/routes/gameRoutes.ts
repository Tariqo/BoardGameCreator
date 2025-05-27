import express from 'express';
import {
  startGameSession,
  getGameState,
  postGameAction,
} from '../controllers/gameController';

const router = express.Router();

// Create a new in-memory game session from published MongoDB game
router.post('/:id/start', startGameSession);

// Get current game session state
router.get('/:id/state', getGameState);

// Perform an action (play card, draw card, etc.)
router.post('/:id/action', postGameAction);

export default router;
