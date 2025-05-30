import React, { useEffect, useState } from 'react';
import { Card } from '../types/Card';
import { BoardElement } from '../types/BoardElement';
import { useParams } from 'react-router-dom';
import GamePlayCanvas from '../components/GameplayUI/GamePlayCanvas';
import PlayTopbar from '../components/Layout/PlayTopbar';
import GameLog from '../components/GameplayUI/GameLog';
import config from '../config/config';

const PlayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [canvasZones, setCanvasZones] = useState<BoardElement[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<Card[]>([]);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const playerIndex = 0;

  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (entry: string) => setLogs((prev) => [...prev.slice(-50), entry]);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`${config.apiUrl}/api/game/session/${sessionId}/state`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((game) => {
        syncWithBackend(game);
      })
      .catch((err) => {
        console.error('Failed to fetch game state', err);
      });
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
      syncWithBackend(updated);

      if (!res.ok) {
        console.error(`Server responded with status ${res.status}:`, updated);
        throw new Error('Action failed');
      }
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
      <PlayTopbar />
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
