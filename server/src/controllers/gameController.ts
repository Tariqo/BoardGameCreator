import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { v4 as uuidv4 } from 'uuid';
import { inMemoryGames } from '../data/inMemoryGames';

export const startGameSession = async (req: Request, res: Response): Promise<void> => {
  const publishedGameId = req.params.id;

  try {
    const gameDoc = await Game.findById(publishedGameId).lean();
    if (!gameDoc) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const sessionId = uuidv4();
    const players = gameDoc.players.map((p: any, i: number) => ({
      name: p.name,
      hand: gameDoc.deck.slice(i * 5, (i + 1) * 5),
    }));
    const deck = gameDoc.deck.slice(players.length * 5);

    inMemoryGames[sessionId] = {
      ruleSet: gameDoc.ruleSet,
      canvas: gameDoc.elements,
      deck,
      discardPile: [],
      playedCards: [],
      players,
      turn: 0,
      direction: 1,
    };

    res.json({ sessionId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start game session', details: err });
  }
};

export const getGameState = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.params.id;
  const game = inMemoryGames[sessionId];

  if (!game) {
    res.status(404).json({ error: 'Game session not found' });
    return;
  }

  res.json(game);
};

export const postGameAction = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.params.id;
  const game = inMemoryGames[sessionId];

  if (!game) {
    res.status(404).json({ error: 'Game session not found' });
    return;
  }

  const { type, cardId, playerIndex, position } = req.body;

  if (playerIndex == null || !game.players[playerIndex]) {
    res.status(400).json({ error: 'Invalid player index' });
    return;
  }

  const hand = game.players[playerIndex].hand;

  switch (type) {
    case 'play_card': {
      const cardIndex = hand.findIndex((c: any) => c.id === cardId);
      if (cardIndex === -1) {
        res.status(400).json({ error: 'Card not in player hand' });
        return;
      }

      const [card] = hand.splice(cardIndex, 1);
      game.playedCards.push({ ...card, x: position?.x ?? 0, y: position?.y ?? 0 });

      if (card.effect === 'discard') {
        game.discardPile.push(card);
      }

      break;
    }

    case 'draw_card': {
      if (game.deck.length === 0) {
        res.status(400).json({ error: 'Deck is empty' });
        return;
      }

      const drawn = game.deck.shift();
      if (drawn) {
        game.players[playerIndex].hand.push(drawn);
      }

      break;
    }

    case 'end_turn': {
      game.turn = (game.turn + game.direction + game.players.length) % game.players.length;
      break;
    }

    case 'reverse_order': {
      game.direction *= -1;
      break;
    }

    case 'skip_next_player': {
      game.turn = (game.turn + 2 * game.direction + game.players.length) % game.players.length;
      break;
    }

    default:
      res.status(400).json({ error: 'Unknown action type' });
      return;
  }

  res.json(game);
};
