import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { GameSession } from '../models/GameSession';
import { evaluateConditions } from '../utils/evaluateConditions';

export const startGameSession = async (req: Request, res: Response): Promise<void> => {
  const publishedGameId = req.params.id;

  try {
    const gameDoc = await Game.findById(publishedGameId).lean();
    if (!gameDoc) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const deck = [...(gameDoc.deck || [])];
    const playerDefs = gameDoc.players && gameDoc.players.length > 0
      ? gameDoc.players
      : [{ name: 'Player 1' }];

    const players = playerDefs.map((p: any, i: number) => ({
      name: p.name || `Player ${i + 1}`,
      hand: deck.splice(0, 5),
    }));

    const session = new GameSession({
      gameId: publishedGameId,
      players,
      deck,
      discardPile: [],
      playedCards: [],
      turn: 0,
      direction: 1,
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

    if (session.turn !== playerIndex) {
      res.status(403).json({ error: 'Not your turn' });
      return;
    }

    const player = session.players[playerIndex];
    if (!player) {
      res.status(400).json({ error: 'Invalid player' });
      return;
    }

    const hand = player.hand;

    if (type === 'play_card') {
      const index = hand.findIndex(c => c.id === cardId);
      if (index === -1) {
        res.status(400).json({ error: 'Card not found in hand' });
        return;
      }

      const card = hand[index];

      const valid = evaluateConditions(card.conditions || [], {
        hand,
        playerId: player.id || '',
        totalPlayers: session.players.length,
        eliminatedPlayerIds: [],
      });

      if (!valid) {
        res.status(400).json({ error: 'Conditions not met' });
        return;
      }

      hand.splice(index, 1);
      session.playedCards.push({ ...card, x: position?.x ?? 0, y: position?.y ?? 0 });

      if (card.effect === 'discard') session.discardPile.push(card);
      if (card.effect === 'reverse') session.direction *= -1;
      if (card.effect === 'skip') {
        session.turn = (session.turn + 2 * session.direction + session.players.length) % session.players.length;
      } else {
        session.turn = (session.turn + session.direction + session.players.length) % session.players.length;
      }
    }

    else if (type === 'draw_card') {
      const drawn = session.deck.shift();
      if (drawn) hand.push(drawn);
    }

    else if (type === 'end_turn') {
      session.turn = (session.turn + session.direction + session.players.length) % session.players.length;
    }

    else {
      res.status(400).json({ error: 'Unknown action type' });
      return;
    }

    await session.save();
    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ error: 'Action failed', details: err });
  }
};
