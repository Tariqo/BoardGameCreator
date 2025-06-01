import mongoose from 'mongoose';

const publishedGameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
  }],
  ruleSet: {
    type: Object,
    required: true,
  },
  canvas: [{
    type: Object,
  }],
  gameFlow: [{
    type: Object,
  }],
  deck: [{
    type: Object,
  }],
  discardPile: [{
    type: Object,
  }],
  players: [{
    type: Object,
  }],
  maxPlayers: {
    type: Number,
    required: true,
  },
  initialHandCount: [{
    type: Number,
  }],
  shuffleOnStart: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

const PublishedGame = mongoose.model('PublishedGame', publishedGameSchema, 'games');

export default PublishedGame; 