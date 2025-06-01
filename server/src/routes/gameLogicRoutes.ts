import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { nextTurn, rollDice } from '../controllers/gameLogicController';

const router = express.Router();

router.use(authenticateToken);
// router.post('/:id/next-turn', nextTurn);
router.get('/roll-dice', rollDice);

export default router;
