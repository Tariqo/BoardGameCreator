import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { GameSession } from '../models/GameSession';

export const startGameSession = async (req: Request, res: Response): Promise<void> => {
  const publishedGameId = req.params.id;

  try {
    const gameDoc = await Game.findById(publishedGameId).lean();
    if (!gameDoc) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const players = gameDoc.players.map((p: any, i: number) => ({
      name: p.name,
      hand: gameDoc.deck.slice(i * 5, (i + 1) * 5),
    }));
    const deck = gameDoc.deck.slice(players.length * 5);

    const session = new GameSession({
    gameId: publishedGameId,
    players,
    deck,
    discardPile: [],
    playedCards: [],
    turn: 0,
    direction: 1,

    // ✅ Correct usage of elements
    canvas: gameDoc.elements || [],
    ruleSet: gameDoc.ruleSet || {},
    gameFlow: gameDoc.gameFlow || [],
    });

    await session.save();
    res.status(201).json({ sessionId: session._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start game session', details: err });
  }
};


export const getGameState = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.params.id;

  try {
    const session = await GameSession.findById(sessionId).lean();
    if (!session) {
      res.status(404).json({ error: 'Game session not found' });
      return;
    }

    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch game state', details: err });
  }
};

export const postGameAction = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.params.id;
  const { type, cardId, playerIndex, position } = req.body;

  try {
    const session = await GameSession.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Game session not found' });
      return;
    }

    const hand = session.players[playerIndex]?.hand;
    if (!hand) {
      res.status(400).json({ error: 'Invalid player index' });
      return;
    }

    switch (type) {
      case 'play_card': {
        const cardIndex = hand.findIndex((c: any) => c.id === cardId);
        if (cardIndex === -1) {
          res.status(400).json({ error: 'Card not in player hand' });
          return;
        }

        const [card] = hand.splice(cardIndex, 1);
        session.playedCards.push({ ...card, x: position?.x ?? 0, y: position?.y ?? 0 });

        if (card.effect === 'discard') {
          session.discardPile.push(card);
        }
        break;
      }

      case 'draw_card': {
        if (session.deck.length === 0) {
          res.status(400).json({ error: 'Deck is empty' });
          return;
        }

        const drawn = session.deck.shift();
        if (drawn) hand.push(drawn);
        break;
      }

      case 'end_turn': {
        session.turn = (session.turn + session.direction + session.players.length) % session.players.length;
        break;
      }

      case 'reverse_order': {
        session.direction *= -1;
        break;
      }

      case 'skip_next_player': {
        session.turn = (session.turn + 2 * session.direction + session.players.length) % session.players.length;
        break;
      }

      default:
        res.status(400).json({ error: 'Unknown action type' });
        return;
    }

    await session.save();
    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply action', details: err });
  }
};
