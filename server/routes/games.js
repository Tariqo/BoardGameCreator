// server/routes/games.js
// This router handles all routes related to game discovery and search functionality

const express = require('express');
const router = express.Router();
const Game = require('../models/Game'); // Mongoose model for Game documents

// === Combined Search Endpoint ===
// Supports:
// 2.1: Name-Based Search (partial matches)
// 2.2: Filter by genre, number of players, and play time
// 2.3: Sort by rating or creation date
router.get('/search', async (req, res) => {
  const { q, genre, players, time, sort } = req.query;
  const query = {};

  // Partial match on game name
  if (q && q.trim() !== '') {
    query.name = { $regex: q, $options: 'i' };
  }

  // Filters
  if (genre) query.genre = genre;
  if (players) query.players = parseInt(players); // exact match
  if (time) query.playTime = { $lte: parseInt(time) };

  // Sorting
  let sortObj = {};
  if (sort === 'rating') sortObj = { rating: -1 };
  if (sort === 'date') sortObj = { createdAt: -1 };

  try {
    const games = await Game.find(query).sort(sortObj);
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// === Game Player Count Info (Live Activity) ===
// 2.4: Returns the number of currently active players in a game session
// Requires a shared in-memory map tracking Socket.IO room sizes
const activeGames = require('../cache/activeGames'); // Shared session state from socket logic

router.get('/status', (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing game ID' });

  const count = activeGames.get(id) || 0;
  res.json({ playersOnline: count });
});

// === Popular Games List ===
// 2.5: Returns the top 10 most played games for the homepage
router.get('/popular', async (req, res) => {
  try {
    const games = await Game.find().sort({ plays: -1 }).limit(10);
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Export the router so it can be mounted in the main server app
module.exports = router;
