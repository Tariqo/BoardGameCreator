import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { GameSession } from '../models/GameSession';
import { evaluateConditions } from '../utils/evaluateConditions';
import { resolveNextStep } from '../utils/gameFlowManager';
import { evaluateWinConditions } from '../utils/evaluateWinConditions';

console.log('🧩 Using evaluateConditions from:', require.resolve('../utils/evaluateConditions'));

function inferStepType(label: string): string | undefined {
  const normalized = label.toLowerCase().trim();
  if (normalized.includes('draw')) return 'draw_card';
  if (normalized.includes('play')) return 'play_card';
  if (normalized.includes('end')) return 'end_turn';
  if (normalized.includes('reverse')) return 'reverse_order';
  if (normalized.includes('skip')) return 'skip_next_player';
  if (normalized.includes('check') || normalized.includes('win')) return 'check_win';
  return undefined;
}

function executeAutoSteps(session: any, flowContext: any) {
  let currentStep = session.gameFlow?.find((step: any) => step.id === session.currentStepId);
  while (currentStep && (!currentStep.type || ['start_turn', 'end_turn', 'check_win'].includes(currentStep.type))) {
    if (!currentStep.type && currentStep.label) {
      currentStep.type = inferStepType(currentStep.label);
    }
    switch (currentStep.type) {
      case 'start_turn': {
        session.logs ||= [];
        session.logs.push(`🔄 Start of turn: ${session.players[session.turn].name}`);
        break;
      }
      case 'end_turn': {
        session.turn = (session.turn + session.direction + session.players.length) % session.players.length;
        session.logs ||= [];
        session.logs.push(`🔚 End of turn. Next player: ${session.players[session.turn].name}`);
        break;
      }
      case 'check_win': {
        const player = session.players[session.turn];
        const hand = player.hand || [];
        const hasPlayableCard = hand.some((card: any) => {
          return !card.playConditions || evaluateConditions(card.playConditions, flowContext);
        });
        if (!hasPlayableCard) {
          const winMet = evaluateWinConditions(player.winConditions || [], flowContext);
          if (winMet) {
            session.logs ||= [];
            session.logs.push(`🏆 ${player.name} wins!`);
            (session as any).winnerIndex = session.turn;
            return;
          }
        }
        break;
      }
    }
    const nextStepId = resolveNextStep(currentStep, flowContext);
    if (!nextStepId) break;
    session.currentStepId = nextStepId;
    currentStep = session.gameFlow.find((step: any) => step.id === nextStepId);
  }
}

export const postGameAction = async (req: Request, res: Response): Promise<any> => {
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

    const eliminatedPlayerIds = session.players.map((p, idx) => (p.eliminated ? idx.toString() : null)).filter((id): id is string => id !== null);
    const flowContext = {
      deck: session.deck,
      hand,
      player,
      playerId: playerIndex.toString(),
      totalPlayers: session.players.length,
      eliminatedPlayerIds,
    };

    // 🔄 Execute auto steps before checking current step
    executeAutoSteps(session, flowContext);

    let currentStep = session.gameFlow?.find(step => step.id === session.currentStepId);
    while (currentStep && (!currentStep.type || ['check_win'].includes(currentStep.type))) {
      const nextStepId = resolveNextStep(currentStep, flowContext);
      if (!nextStepId) break;
      session.currentStepId = nextStepId;
      currentStep = session.gameFlow.find((step: any) => step.id === nextStepId);
    }

    if (!currentStep) {
      console.error('❌ Current step is undefined for step ID:', session.currentStepId);
      res.status(400).json({ error: 'Current step is undefined' });
      return;
    }

    if (!currentStep.type && currentStep.label) {
      currentStep.type = inferStepType(currentStep.label);
      console.warn(`⚠️ Inferred step type: '${currentStep.label}' → '${currentStep.type}'`);
    }

    console.log('🔍 Current step:', currentStep);
    console.log('🔍 Comparing action type:', type, 'vs expected:', currentStep.type);

    if (type !== currentStep.type) {
      console.warn(`🚫 Action type mismatch: got '${type}' but expected '${currentStep.type}'`);
      res.status(403).json({ error: `Action '${type}' is not allowed in current step '${currentStep.type}'` });
      return;
    }

    switch (type) {
      case 'play_card': {
        console.log('🎯 Attempting to play card:', cardId);
        const index = hand.findIndex(c => c.id === cardId);
        if (index === -1) {
          res.status(400).json({ error: 'Card not found in hand' });
          return;
        }
        const card = hand[index];
        const valid = !card.playConditions || evaluateConditions(card.playConditions, {
          hand,
          playerId: playerIndex.toString(),
          totalPlayers: session.players.length,
          eliminatedPlayerIds,
          player,
          lastPlayedTags: session.lastPlayedTags,
          card,
        });
        if (!valid) {
          res.status(403).json({ error: 'Card play conditions not met' });
          return;
        }
        hand.splice(index, 1);
        session.playedCards.push({ ...card, x: position?.x ?? 0, y: position?.y ?? 0 });
        session.lastPlayedTags = card.tags || [];
        if (card.effect === 'discard') session.discardPile.push(card);
        if (card.effect === 'reverse') session.direction *= -1;
        session.turn = (session.turn + (card.effect === 'skip' ? 2 : 1) * session.direction + session.players.length) % session.players.length;
        session.markModified('players');
        session.markModified('playedCards');
        session.markModified('discardPile');
        break;
      }
      case 'draw_card': {
        if (session.deck.length === 0) {
          res.status(400).json({ error: 'Deck is empty' });
          return;
        }
        const drawn = session.deck.shift();
        if (drawn) hand.push(drawn);
        session.markModified('players');
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
      case 'attempt_play_card_or_draw': {
        res.status(403).json({ error: 'attempt_play_card_or_draw is not a valid flow step' });
        return;
      }
      default: {
        res.status(400).json({ error: 'Unknown action type' });
        return;
      }
    }

    const nextStepId = resolveNextStep(currentStep, flowContext);
    if (nextStepId) {
      session.currentStepId = nextStepId;
      const nextStep = session.gameFlow.find(step => step.id === nextStepId);
      if (nextStep) {
        session.logs ||= [];
        session.logs.push(`➡️ Next step: ${nextStep.label || nextStep.type}`);
      }
      executeAutoSteps(session, flowContext);
    }

    if ((session as any).winnerIndex != null) {
      await session.save();
      res.status(200).json({
        message: `${session.players[(session as any).winnerIndex].name} wins!`,
        winnerIndex: (session as any).winnerIndex,
        session,
      });
      return;
    }

    await session.save();
    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ error: 'Action failed', details: err });
  }
};

export const startGameSession = async (req: Request, res: Response): Promise<void> => {
  const publishedGameId = req.params.id;

  try {
    const gameDoc = await Game.findById(publishedGameId).lean();
    if (!gameDoc) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const deck = [...(gameDoc.deck || [])];
    const playerDefs = gameDoc.players?.length ? gameDoc.players : [{ name: 'Player 1' }];

    const players = playerDefs.map((p: any, i: number) => ({
      name: p.name || `Player ${i + 1}`,
      hand: deck.splice(0, 5),
      eliminated: false,
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
      currentStepId: gameDoc.gameFlow?.[0]?.id || null,
      lastPlayedTags: [],
      logs: [],
    });

    const flowContext = {
      deck: session.deck,
      hand: session.players[0].hand,
      player: session.players[0],
      playerId: '0',
      totalPlayers: session.players.length,
      eliminatedPlayerIds: [],
    };
    executeAutoSteps(session, flowContext);

    await session.save();
    res.status(201).json({ sessionId: session._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start game session', details: err });
  }
};

export const getGameState = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await GameSession.findById(req.params.id).lean();
    if (!session) {
      res.status(404).json({ error: 'Game session not found' });
      return;
    }
    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch game state', details: err });
  }
};
