import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../types/Card';
import { BoardElement } from '../types/BoardElement';
import { useParams } from 'react-router-dom';
import GamePlayCanvas from '../components/GameplayUI/GamePlayCanvas';
import PlayTopbar from '../components/Layout/PlayTopbar';
import GameLog from '../components/GameplayUI/GameLog';
import config from '../config/config';
import { trackGameEnd, trackPlayPageMinutes } from '../utils/analytics';

interface GameState {
  session: {
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
  };
}

type RouteParams = {
  sessionId?: string;
};

const PlayPage: React.FC = () => {
  const params = useParams<keyof RouteParams>();
  const sessionId = params.sessionId;
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [canvasZones, setCanvasZones] = useState<BoardElement[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<Card[]>([]);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const playerIndex = 0;

  const minuteIntervalRef = useRef<number | undefined>(undefined);
  const minutesSpentRef = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  const addLog = (entry: string) => setLogs((prev) => [...prev.slice(-50), entry]);

  useEffect(() => {
    minuteIntervalRef.current = window.setInterval(() => {
      minutesSpentRef.current += 1;
      trackPlayPageMinutes(gameState?.session?.gameId, minutesSpentRef.current);
    }, 60000);

    return () => {
      if (minuteIntervalRef.current) window.clearInterval(minuteIntervalRef.current);
      if (minutesSpentRef.current > 0) {
        trackPlayPageMinutes(gameState?.session?.gameId, minutesSpentRef.current);
      }
    };
  }, [gameState?.session?.gameId]);

  useEffect(() => {
    const sessionStartTime = Date.now();
    return () => {
      if (gameState?.session) {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
        trackGameEnd(gameState.session.gameId, gameState.session.gameName, duration);
      }
    };
  }, [gameState?.session]);

  useEffect(() => {
    if (!sessionId) return;

    // Fetch initial game state
    fetch(`${config.apiUrl}/api/game/session/${sessionId}/state`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((game) => {
        syncWithBackend(game);
        setGameState(game);
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
          setGameState({ session: msg.state });
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

  const syncWithBackend = (game: any) => {
    const session = game.session || game;
    if (!session || !Array.isArray(session.players) || typeof session.turn !== 'number') {
      console.warn('❗Invalid game state received. Skipping sync.');
      return;
    }

    setDeck(Array.isArray(session.deck) ? session.deck : []);
    setDiscardPile(Array.isArray(session.discardPile) ? session.discardPile : []);
    setCanvasZones(session.canvas || session.elements || []);
    setHand(session.players[playerIndex]?.hand || []);
    setPlayedCards(Array.isArray(session.playedCards) ? session.playedCards : []);
    addLog(`🔄 Turn: ${session.turn} (${session.players[session.turn]?.name || 'Unknown'})`);
    setLogs(Array.isArray(session.logs) ? session.logs : []);
  };

  const postAction = async (type: string, extra: Record<string, any> = {}) => {
    if (!sessionId) return;

    const payload = {
      type,
      playerIndex,
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
    addLog(`🃏 Played card: ${card.name}`);
    postAction('play_card', { cardId: card.id, position: pos });
  };

  const handleDrawCard = () => {
    addLog(`📥 Drew a card`);
    postAction('draw_card');
  };

  return (
    <div className="relative w-full h-screen bg-green-800 text-white overflow-hidden flex flex-col">
      <PlayTopbar wsRef={wsRef} sessionId={sessionId} />
      <div className="flex-1 relative">
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
            className="h-32 shadow-md rounded border-2 border-white hover:scale-105 transition-transform"
            draggable
            onDragStart={() => setDraggedCard(card)}
            onDragEnd={() => setDraggedCard(null)}
          />
        ))}

        <button onClick={handleDrawCard} className="bg-blue-500 px-4 py-2 rounded ml-4">
          Draw Card
        </button>
      </div>
    </div>
  );
};

export default PlayPage;
