import { Request, Response } from 'express';
import { Game } from '../models/Game';
import PublishedGame from '../models/PublishedGame';

export const savePublishedGame = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const gameData = {
      ...req.body,
      creator: userId,
    };
    
    const game = await PublishedGame.create(gameData);
    return res.json({ success: true, data: game });
  } catch (error) {
    console.error('Error saving published game:', error);
    return res.status(500).json({ success: false, message: 'Failed to save game' });
  }
};

export const getMyGames = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const games = await PublishedGame.find({ creator: userId })
      .sort({ createdAt: -1 })
      .populate('creator', 'username');

    return res.json({ success: true, data: games });
  } catch (error) {
    console.error('Error fetching user games:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch games' });
  }
};

export const getAllGames = async (req: Request, res: Response): Promise<Response> => {
  try {
    const games = await PublishedGame.find()
      .sort({ createdAt: -1 })
      .populate('creator', 'username');

    return res.json({ success: true, data: games });
  } catch (error) {
    console.error('Error fetching all games:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch games' });
  }
};
