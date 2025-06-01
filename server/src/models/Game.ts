import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  name: String,
  ruleSet: Object,
  elements: Array,
  deck: Array,
  discardPile: Array,
  players: Array,
  gameFlow: Array,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export const Game = mongoose.model('Game', GameSchema);
