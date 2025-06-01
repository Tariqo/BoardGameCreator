import express from 'express';
import { Game } from '../models/Game';

const router = express.Router();

// Get all games or search by query
router.get('/search', async (req, res) => {
  const { q, genre, players, time, sort } = req.query;
  const query: any = {};

  // Partial match on game name
  if (q && typeof q === 'string' && q.trim() !== '') {
    query.name = { $regex: q, $options: 'i' };
  }

  // Filters
  if (genre && typeof genre === 'string') query.genre = genre;
  if (players && typeof players === 'string') query.players = parseInt(players);
  if (time && typeof time === 'string') query.playTime = { $lte: parseInt(time) };

  // Sorting
  let sortObj: any = { createdAt: -1 }; // Default sort by newest
  if (sort === 'rating') sortObj = { rating: -1 };

  try {
    const games = await Game.find(query)
      .sort(sortObj)
      .populate('createdBy', 'username');

    res.json({ success: true, data: games });
  } catch (err) {
    console.error('Error searching games:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get popular games
router.get('/popular', async (req, res) => {
  try {
    const games = await Game.find()
      .sort({ plays: -1 })
      .limit(10)
      .populate('createdBy', 'username');

    res.json({ success: true, data: games });
  } catch (err) {
    console.error('Error fetching popular games:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 