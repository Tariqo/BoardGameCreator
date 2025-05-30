import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { savePublishedGame, getMyGames, getAllGames } from '../controllers/publishedGameController';

const router = express.Router();

// Wrap controller functions to satisfy Express types
const wrapHandler = (handler: (req: Request, res: Response) => Promise<Response>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
};

// Public route to get all games
router.get('/all', wrapHandler(getAllGames));

// Protected routes
router.post('/publish', authenticateToken, wrapHandler(savePublishedGame));
router.get('/my', authenticateToken, wrapHandler(getMyGames));

export default router;
