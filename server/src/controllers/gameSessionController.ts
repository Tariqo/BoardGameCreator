import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { GameSession } from '../models/GameSession';
import { evaluateConditions } from '../utils/evaluateConditions';

console.log('🧩 Using evaluateConditions from:', require.resolve('../utils/evaluateConditions'));

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
      lastPlayedTags: [],
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
  console.log('[POST] /api/game/:id/action hit with type:', req.body.type);
  const sessionId = req.params.id;
  const { type, cardId, playerIndex, position } = req.body;

  try {
    const session = await GameSession.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Game session not found' });
      return;
    }

    if (playerIndex == null || !session.players[playerIndex]) {
      res.status(400).json({ error: 'Invalid player index' });
      return;
    }

    const player = session.players[playerIndex];
    const hand = player.hand;

    switch (type) {
      case 'play_card': {
        const index = hand.findIndex(c => c.id === cardId);
        if (index === -1) {
          res.status(400).json({ error: 'Card not found in hand' });
          return;
        }

        const card = hand[index];
        const context = {
          hand,
          playerId: playerIndex.toString(),
          totalPlayers: session.players.length,
          eliminatedPlayerIds: session.players
            .map((p, idx) => (p.eliminated ? idx.toString() : null))
            .filter((id): id is string => id !== null),
          player,
          lastPlayedTags: session.lastPlayedTags,
        };

        const valid = !card.playConditions || evaluateConditions(card.playConditions, {
          hand,
          playerId: playerIndex.toString(),
          totalPlayers: session.players.length,
          eliminatedPlayerIds: session.players
            .map((p, idx) => (p.eliminated ? idx.toString() : null))
            .filter((id): id is string => id !== null),
          player,
          lastPlayedTags: session.lastPlayedTags,
          card, // ✅ Add this
        });


        if (!valid) {
          console.log('→ Condition evaluation: ❌ NOT met');
          res.status(403).json({ error: 'Card play conditions not met' });
          return;
        }

        console.log('→ Condition evaluation: ✅ MET');

        hand.splice(index, 1);
        session.playedCards.push({ ...card, x: position?.x ?? 0, y: position?.y ?? 0 });
        session.lastPlayedTags = card.tags || [];

        if (card.effect === 'discard') session.discardPile.push(card);
        if (card.effect === 'reverse') session.direction *= -1;
        if (card.effect === 'skip') {
          session.turn = (session.turn + 2 * session.direction + session.players.length) % session.players.length;
        } else {
          session.turn = (session.turn + session.direction + session.players.length) % session.players.length;
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

      case 'attempt_play_card_or_draw': {
        const playableIndex = hand.findIndex((card) => {
          const context = {
            hand,
            playerId: playerIndex.toString(),
            totalPlayers: session.players.length,
            eliminatedPlayerIds: session.players
              .map((p, idx) => (p.eliminated ? idx.toString() : null))
              .filter((id): id is string => id !== null),
            player,
            lastPlayedTags: session.lastPlayedTags,
          };

          return !card.playConditions || evaluateConditions(card.playConditions, context);
        });

        if (playableIndex !== -1) {
          res.status(200).json({
            message: 'Playable card found',
            playableCardId: hand[playableIndex].id,
          });
          return;
        }

        const drawn = session.deck.shift();
        if (drawn) {
          hand.push(drawn);

          const context = {
            hand,
            playerId: playerIndex.toString(),
            totalPlayers: session.players.length,
            eliminatedPlayerIds: session.players
              .map((p, idx) => (p.eliminated ? idx.toString() : null))
              .filter((id): id is string => id !== null),
            player,
            lastPlayedTags: session.lastPlayedTags,
          };

          const canPlayDrawn = !drawn.playConditions || evaluateConditions(drawn.playConditions, context);

          if (canPlayDrawn) {
            res.status(200).json({
              message: 'Drew a playable card',
              playableCardId: drawn.id,
            });
            return;
          }
        }

        session.turn = (session.turn + session.direction + session.players.length) % session.players.length;
        res.status(200).json({ message: 'No playable cards. Turn skipped.' });
        return;
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
    res.status(500).json({ error: 'Action failed', details: err });
  }
};
