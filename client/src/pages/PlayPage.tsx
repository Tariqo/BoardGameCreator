import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../types/Card';
import { BoardElement } from '../types/BoardElement';
import { useParams } from 'react-router-dom';
import GamePlayCanvas from '../components/GameplayUI/GamePlayCanvas';
import PlayTopbar from '../components/Layout/PlayTopbar';
import GameLog from '../components/GameplayUI/GameLog';
import config from '../config/config';
import { trackGameEnd, trackPlayPageMinutes } from '../utils/analytics';
import { useAuth } from '../context/AuthContext';

interface GameState {
  _id: string;
  gameId: string;
  gameName: string;
  players: any[];
  turn: number;
  deck: Card[];
  discardPile: Card[];
  canvas?: BoardElement[];
  elements?: BoardElement[];
  playedCards: Card[];
  logs: string[];
}

type RouteParams = {
  sessionId?: string;
};

const PlayPage: React.FC = () => {
  const params = useParams<keyof RouteParams>();
  const sessionId = params.sessionId;
  const { user } = useAuth();
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [canvasZones, setCanvasZones] = useState<BoardElement[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<Card[]>([]);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number | null>(null);
  const [hasAttemptedJoin, setHasAttemptedJoin] = useState(false);

  const minuteIntervalRef = useRef<number | undefined>(undefined);
  const minutesSpentRef = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  const addLog = (entry: string) => setLogs((prev) => [...prev.slice(-50), entry]);

  useEffect(() => {
    minuteIntervalRef.current = window.setInterval(() => {
      minutesSpentRef.current += 1;
      trackPlayPageMinutes(gameState?.gameId, minutesSpentRef.current);
    }, 60000);

    return () => {
      if (minuteIntervalRef.current) window.clearInterval(minuteIntervalRef.current);
      if (minutesSpentRef.current > 0) {
        trackPlayPageMinutes(gameState?.gameId, minutesSpentRef.current);
      }
    };
  }, [gameState?.gameId]);

  useEffect(() => {
    const sessionStartTime = Date.now();
    return () => {
      if (gameState) {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
        trackGameEnd(gameState.gameId, gameState.gameName, duration);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (!sessionId) return;

    console.log('[PlayPage useEffect] Running. User:', user, 'GameState Players:', gameState?.players);

    // Fetch initial game state
    fetch(`${config.apiUrl}/api/game/session/${sessionId}/state`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((gameSessionData) => {
        syncWithBackend(gameSessionData);
        setGameState(gameSessionData);
      })
      .catch((err) => {
        console.error('Failed to fetch game state', err);
      });

    // Setup WebSocket
    const wsUrl = config.apiUrl.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/?sessionId=${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🟢 WebSocket connected');
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.sessionId !== sessionId) return;

      switch (msg.type) {
        case 'session_started':
        case 'game_update':
        case 'game_over':
          syncWithBackend(msg.state);
          setGameState(msg.state);
          break;
        case 'invitation':
          alert(`🎮 ${msg.from} invited you to a game!`);
          break;
        default:
          console.warn('Unknown WS message type:', msg.type);
      }
    };

    ws.onerror = (err) => {
      console.error('❌ WebSocket error', err);
    };

    ws.onclose = () => {
      console.warn('🔌 WebSocket closed');
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  useEffect(() => {
    console.log('[PlayPage playerIndex useEffect] Running. User:', user, 'GameState:', gameState);
    console.log('[PlayPage playerIndex useEffect] Condition check: user defined?', !!user);
    console.log('[PlayPage playerIndex useEffect] Condition check: gameState defined?', !!gameState);
    if (gameState) {
      console.log('[PlayPage playerIndex useEffect] Condition check: gameState.players defined?', !!gameState.players);
      if (gameState.players) {
        console.log('[PlayPage playerIndex useEffect] Condition check: gameState.players.length > 0?', gameState.players.length > 0, 'Length is:', gameState.players.length);
      }
    }

    if (user && gameState?.players && gameState.players.length > 0) {
      console.log('[PlayPage playerIndex useEffect] Attempting to find playerIndex. Username:', user.username);
      console.log('[PlayPage playerIndex useEffect] Players available (stringified for findIndex):', JSON.stringify(gameState.players));
      
      // Manual check for debugging
      gameState.players.forEach((p: { name: string; [key: string]: any }, index: number) => {
        const pNameChars = Array.from(p.name || '').map(char => char.charCodeAt(0)).join(','); // Added (p.name || '') for safety
        const userNameChars = Array.from(user.username || '').map(char => char.charCodeAt(0)).join(','); // Added (user.username || '') for safety
        
        console.log(
          `[PlayPage playerIndex useEffect] Checking player ${index}: ` +
          `p.name: "${p.name}" (Codes: ${pNameChars}), ` +
          `user.username: "${user.username}" (Codes: ${userNameChars}), ` +
          `Matches? ${p.name === user.username}`
        );
      });

      const idx = gameState.players.findIndex(
        (p: { name: string; [key: string]: any }) => 
          p.name && user.username && p.name.trim() === user.username.trim()
      );
      console.log('[PlayPage playerIndex useEffect] Found index (from findIndex with trim):', idx);
      setCurrentPlayerIndex(idx !== -1 ? idx : null);
      if (idx === -1) {
        console.error('[PlayPage playerIndex useEffect] FAILED TO FIND PLAYER INDEX. User:', JSON.stringify(user), 'Players in GameState:', JSON.stringify(gameState.players));
      }
    } else {
      console.log('[PlayPage playerIndex useEffect] Skipping playerIndex calculation (user, gameState, or players not available/empty).');
      setCurrentPlayerIndex(null);
    }
  }, [user, gameState]);

  // Effect to attempt to join the game session if user is not found in players
  useEffect(() => {
    if (sessionId && user && gameState && currentPlayerIndex === null && !hasAttemptedJoin) {
      // Conditions: session loaded, user loaded, game state loaded,
      // user is NOT in player list, and we haven't tried to join yet.
      
      setHasAttemptedJoin(true); // Mark that we are attempting to join
      console.log(`[PlayPage JoinEffect] User ${user.username} not in game. Attempting to join session ${sessionId}...`);

      fetch(`${config.apiUrl}/api/game/session/${sessionId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        // No body needed as user is identified by httpOnly cookie token
      })
      .then(async (res) => { // Made async to await res.json() in error case
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ message: 'Failed to parse error response' }));
          console.error('[PlayPage JoinEffect] Failed to join game session - API Error:', errData.message || res.statusText);
          alert(`Could not join game: ${errData.message || 'An error occurred.'}`);
          // Optionally, you might want to navigate away or show a persistent error
          throw new Error(errData.message || 'Failed to join game session');
        }
        return res.json();
      })
      .then(updatedSessionFromServer => {
        // The server should ideally broadcast the update via WebSocket,
        // which would trigger syncWithBackend and setGameState.
        // This direct response can be used for immediate feedback or optimistic updates if needed.
        console.log('[PlayPage JoinEffect] Successfully called join endpoint. Response:', updatedSessionFromServer);
        // syncWithBackend(updatedSessionFromServer); // Usually handled by WebSocket update
        // setGameState(updatedSessionFromServer);    // Usually handled by WebSocket update
      })
      .catch(err => {
        // Catching network errors or errors thrown from .then() block
        console.error('[PlayPage JoinEffect] Error during join attempt:', err);
        // If the join failed, we might want to allow trying again or handle differently
        // For now, hasAttemptedJoin will prevent retries by this effect.
      });
    }
  }, [sessionId, user, gameState, currentPlayerIndex, hasAttemptedJoin]);

  const syncWithBackend = (gameSession: any) => {
    console.log('[PlayPage syncWithBackend] Received game state:', gameSession);
    if (gameSession?.players?.length > 0) {
      console.log('[PlayPage syncWithBackend] First player object structure:', JSON.stringify(gameSession.players[0]));
    }

    if (!gameSession || !Array.isArray(gameSession.players) || typeof gameSession.turn !== 'number') {
      console.warn('❗Invalid game state received. Skipping sync.');
      return;
    }

    console.log('[PlayPage syncWithBackend] User:', user);

    // 🔄 Recalculate player index from user
    let localPlayerIndex: number | null = null;
    if (user && gameSession.players) {
      const idx = gameSession.players.findIndex(
        (p: { name?: string }) =>
          p.name?.trim() === user.username?.trim()
      );
      localPlayerIndex = idx !== -1 ? idx : null;
      setCurrentPlayerIndex(localPlayerIndex);
    }

    // ✅ Set game state pieces
    setDeck(Array.isArray(gameSession.deck) ? gameSession.deck : []);
    setDiscardPile(Array.isArray(gameSession.discardPile) ? gameSession.discardPile : []);
    setCanvasZones(gameSession.canvas || gameSession.elements || []);
    setHand(localPlayerIndex !== null && gameSession.players[localPlayerIndex]
      ? gameSession.players[localPlayerIndex].hand || []
      : []
    );
    setPlayedCards(Array.isArray(gameSession.playedCards) ? gameSession.playedCards : []);
    addLog(`🔄 Turn: ${gameSession.turn} (${gameSession.players[gameSession.turn]?.name || 'Unknown'})`);
    setLogs(Array.isArray(gameSession.logs) ? gameSession.logs : []);
  };


  const postAction = async (type: string, extra: Record<string, any> = {}) => {
    if (!sessionId || currentPlayerIndex === null) return;

    const payload = {
      type,
      playerIndex: currentPlayerIndex,
      ...extra,
    };

    try {
      const res = await fetch(`${config.apiUrl}/api/game/session/${sessionId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const updated = await res.json();
      if (!res.ok) {
        console.error(`Server responded with status ${res.status}:`, updated);
        throw new Error('Action failed');
      }
      syncWithBackend(updated);
    } catch (err) {
      console.error(`Error performing action "${type}"`, err);
    }
  };

  const handlePlayCard = (card: Card, pos: { x: number; y: number }) => {
    if (currentPlayerIndex !== gameState?.turn) {
      alert("It's not your turn!");
      return;
    }
    addLog(`🃏 Played card: ${card.name}`);
    postAction('play_card', { cardId: card.id, position: pos });
  };

  const handleDrawCard = () => {
    if (currentPlayerIndex !== gameState?.turn) {
      alert("It's not your turn!");
      return;
    }
    addLog(`📥 Drew a card`);
    postAction('draw_card');
  };

  const isMyTurn = gameState?.turn === currentPlayerIndex;
  const currentTurnPlayerName = gameState?.players[gameState.turn]?.name || 'Unknown';

  console.log('[PlayPage Render] isMyTurn:', isMyTurn, 'currentPlayerIndex:', currentPlayerIndex, 'Hand state length:', hand.length, 'Hand state content:', JSON.stringify(hand).substring(0, 100) + "...");

  return (
    <div className="relative w-full h-screen bg-green-800 text-white overflow-hidden flex flex-col">
      <PlayTopbar wsRef={wsRef} sessionId={sessionId} />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-700 bg-opacity-80 p-2 rounded z-10">
        {gameState && currentPlayerIndex !== null ? (
          isMyTurn ? (
            <span className="text-xl font-bold text-yellow-400">👑 Your Turn!</span>
          ) : (
            <span className="text-lg">⏳ Waiting for {currentTurnPlayerName}...</span>
          )
        ) : (
          <span className="text-lg">Loading game state...</span>
        )}
      </div>
      <div className="flex-1 relative pt-12">
        <GamePlayCanvas
          canvasZones={canvasZones}
          playedCards={playedCards}
          discardPile={discardPile}
          draggedCard={draggedCard}
          onPlayCard={handlePlayCard}
        />
        <GameLog logs={logs} />
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-6">
        {hand.map((card) => (
          <img
            key={card.id}
            src={card.imageUrl}
            alt={card.name}
            className={`h-32 shadow-md rounded border-2 border-white ${isMyTurn ? 'hover:scale-105 cursor-grab' : 'opacity-70 cursor-not-allowed'} transition-transform`}
            draggable={isMyTurn}
            onDragStart={(e) => {
              if (!isMyTurn) {
                e.preventDefault();
                return;
              }
              setDraggedCard(card);
            }}
            onDragEnd={() => setDraggedCard(null)}
          />
        ))}

        <button
          onClick={handleDrawCard}
          className={`bg-blue-500 px-4 py-2 rounded ml-4 ${!isMyTurn ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={!isMyTurn}
        >
          Draw Card
        </button>
      </div>
    </div>
  );
};

export default PlayPage;
