import mongoose from 'mongoose';

const GameSessionSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  players: {
    type: [
      {
        name: String,
        hand: Array,
      },
    ],
    required: true,
  },
  deck: {
    type: Array,
    default: [],
    required: true,
  },
  discardPile: {
    type: Array,
    default: [],
    required: true,
  },
  playedCards: {
    type: Array,
    default: [],
    required: true,
  },
  turn: {
    type: Number,
    required: true,
    default: 0,
  },
  direction: {
    type: Number,
    required: true,
    default: 1,
  },

  // ✅ Add these fields
  canvas: {
    type: Array,
    default: [],
  },
  ruleSet: {
    type: Object,
    default: {},
  },
  gameFlow: {
    type: Array,
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const GameSession = mongoose.model('GameSession', GameSessionSchema);
