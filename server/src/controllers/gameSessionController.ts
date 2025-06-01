import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { GameSession } from '../models/GameSession';
import { evaluateConditions } from '../utils/evaluateConditions';
import { resolveNextStep } from '../utils/gameFlowManager';
import { evaluateWinConditions } from '../utils/evaluateWinConditions';
import { sendToSession } from '../websocketServer';

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

    if (session.turn !== playerIndex) {
      res.status(403).json({ error: "It's not your turn" });
      return;
    }

    const player = session.players[playerIndex];
    const hand = player.hand;

    const eliminatedPlayerIds = session.players
      .map((p, idx) => (p.eliminated ? idx.toString() : null))
      .filter((id): id is string => id !== null);

    const flowContext = {
      deck: session.deck,
      hand,
      player,
      playerId: playerIndex.toString(),
      totalPlayers: session.players.length,
      eliminatedPlayerIds,
    };

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

        if (card.effect === 'reverse') {
            session.direction *= -1;
            session.logs.push(`🔄 Play direction reversed!`);
            session.markModified('direction'); 
        }

        session.markModified('players');
        session.markModified('playedCards');
        session.markModified('discardPile');
        session.markModified('logs');
        break;
      }
      case 'draw_card': {
        if (session.deck.length === 0) {
          res.status(400).json({ error: 'Deck is empty' });
          return;
        }
        const drawn = session.deck.shift();
        if (drawn) {
          hand.push(drawn);
          session.logs.push(`✏️ ${player.name} drew a card.`);
        }
        session.markModified('players');
        session.markModified('logs');
        break;
      }
      case 'end_turn': {
        // This case handles when a player explicitly clicks the "End Turn" button.
        // The game flow might also have "end_turn" steps that are handled by executeAutoSteps.
        const oldTurn = session.turn;
        const playerEndingTurn = session.players[oldTurn]?.name || 'A player';

        // Add any logic here for effects that happen specifically on manual turn end,
        // or if a card played earlier this turn modifies how the turn ends (e.g., skip).
        // For now, basic turn advancement:
        let turnIncrement = 1;
        // Example: if (session.applySkipEffectOnTurnEnd) { turnIncrement = 2; session.applySkipEffectOnTurnEnd = false; }

        session.turn = (session.turn + (turnIncrement * session.direction) + session.players.length) % session.players.length;
        
        session.logs.push(`🏁 ${playerEndingTurn} ended their turn.`);
        // This log might be redundant if executeAutoSteps also logs for an 'end_turn' game flow step.
        // Consider if executeAutoSteps's 'end_turn' log is sufficient or if this provides valuable context for manual end turns.
        // If executeAutoSteps handles an 'end_turn' step immediately after this, it might log again with the new player's turn.
        // For now, let's keep it to see the sequence.
        // session.logs.push(`  ➡️ Next player is ${session.players[session.turn]?.name || 'Unknown'}.`);

        session.markModified('turn');
        session.markModified('players'); // If hand was modified and not marked earlier
        session.markModified('logs');
        // session.markModified('skipNextTurn'); // If using a skip flag
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

    await session.save();

    if ((session as any).winnerIndex != null) {
      sendToSession(session._id.toString(), {
        type: 'game_over',
        winnerIndex: (session as any).winnerIndex,
        sessionId: session._id,
        state: session.toObject(),
      });

      res.status(200).json({
        message: `${session.players[(session as any).winnerIndex].name} wins!`,
        winnerIndex: (session as any).winnerIndex,
        session,
      });
      return;
    }

    sendToSession(session._id.toString(), {
      type: 'game_update',
      sessionId: session._id,
      state: session.toObject(),
    });

    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ error: 'Action failed', details: err });
  }
};

export const startGameSession = async (req: Request, res: Response): Promise<void> => {
  console.log('[startGameSession] req.user:', (req as any).user);
  console.log('[startGameSession] req.userId:', (req as any).userId);
  const publishedGameId = req.params.id;
  // Assuming req.user is populated by authentication middleware
  const authenticatedUser = (req as any).user; 

  try {
    const gameDoc = await Game.findById(publishedGameId).lean();
    if (!gameDoc) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const deck = [...(gameDoc.deck || [])];
    // Use a default player definition if gameDoc.players is empty or not defined
    const playerDefs = gameDoc.players?.length ? gameDoc.players : [{}]; // Default to one player slot if none defined

    const players = playerDefs.map((pDef: any, i: number) => {
      let playerName = pDef.name; // Use name from game definition if available
      // If this is the first player (index 0) and an authenticated user is present,
      // and the game definition didn't specify a name for the first player,
      // use the authenticated user's username.
      if (i === 0 && authenticatedUser?.username && !playerName) {
        playerName = authenticatedUser.username;
      }
      // Fallback if no name is determined yet
      if (!playerName) {
        playerName = `Player ${i + 1}`;
      }
      return {
        name: playerName,
        // Consider adding userId here if available: userId: authenticatedUser?.id (if i === 0)
        hand: deck.splice(0, gameDoc.ruleSet?.initialHandCount || 5), // Use initialHandCount from ruleSet or default
        eliminated: false,
      };
    });

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

    sendToSession(session._id.toString(), {
      type: 'session_started',
      sessionId: session._id,
      state: session.toObject(),
    });

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

export const joinGameSession = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  const authenticatedUser = (req as any).user; // From authenticateToken

  if (!authenticatedUser) {
    res.status(401).json({ message: 'User not authenticated.' });
    return;
  }

  try {
    const session = await GameSession.findById(sessionId);

    if (!session) {
      res.status(404).json({ message: 'Game session not found.' });
      return;
    }

    // Check if user is already in the session (using userId if available, otherwise username)
    const userAlreadyInSession = session.players.some(
      (player: any) => 
        (player.userId && player.userId.toString() === authenticatedUser._id.toString()) || 
        player.name === authenticatedUser.username
    );

    if (userAlreadyInSession) {
      // User is already part of the game, send current state
      res.status(200).json(session.toObject()); 
      return;
    }

    const maxPlayers = session.ruleSet?.maxPlayers || 2; // Default to 2 if not defined
    if (session.players.length >= maxPlayers) {
      res.status(403).json({ message: 'Game session is full.' });
      return;
    }

    // Add the new player
    const newPlayer = {
      name: authenticatedUser.username, // Or authenticatedUser.name
      userId: authenticatedUser._id, // Store the MongoDB ObjectId
      hand: [], // New players start with an empty hand for now
      eliminated: false,
      // Any other default player properties
    };
    session.players.push(newPlayer);
    session.logs.push(`👋 ${authenticatedUser.username} joined the game!`);

    await session.save();

    // Broadcast the updated game state to all clients in the session
    sendToSession(session._id.toString(), {
      type: 'game_update', // Or a more specific 'player_joined' type if you prefer
      sessionId: session._id.toString(),
      state: session.toObject(),
    });

    console.log(`Player ${authenticatedUser.username} joined session ${sessionId}. Players:`, session.players.map(p=>p.name));
    res.status(200).json(session.toObject());

  } catch (error) {
    console.error('Error joining game session:', error);
    res.status(500).json({ message: 'Error joining game session.', details: (error as Error).message });
  }
};
