import { Request, Response } from 'express';
import { Game } from '../models/Game';

export const savePublishedGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId; // Comes from authenticateToken middleware
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      ruleSet,
      canvas,
      gameFlow,
      deck,
      discardPile,
      players,
      maxPlayers,
      initialHandCount,
    } = req.body;
    
    const saved = await Game.create({
      name: ruleSet.name || 'Untitled Game',
      ruleSet,
      elements: canvas,
      gameFlow,
      deck,
      discardPile,
      players,
      maxPlayers,
      initialHandCount,
      createdBy: userId,
    });

    res.status(201).json({ success: true, gameId: saved._id });
  } catch (err) {
    console.error('Error publishing game:', err);
    res.status(500).json({ success: false, message: 'Failed to publish game' });
  }
};

export const getMyGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const games = await Game.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: games });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch games' });
  }
};
