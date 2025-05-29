import React, { useEffect, useState } from 'react';
import { Card } from '../types/Card';
import { BoardElement } from '../types/BoardElement';
import { useParams } from 'react-router-dom';
import GamePlayCanvas from '../components/GameplayUI/GamePlayCanvas';
import PlayTopbar from '../components/Layout/PlayTopbar';

const PlayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [canvasZones, setCanvasZones] = useState<BoardElement[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<Card[]>([]);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const playerIndex = 0;

  useEffect(() => {
    if (!sessionId) return;

    console.log('Fetching game state for sessionId:', sessionId);

    fetch(`http://localhost:5000/api/game/session/${sessionId}/state`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((game) => {
        console.log('Game state received:', game);
        syncWithBackend(game);
      })
      .catch((err) => {
        console.error('Failed to fetch game state', err);
      });
  }, [sessionId]);

  const syncWithBackend = (game: any) => {
    console.log('Syncing with backend game data:', game);
    setDeck(game.deck);
    setDiscardPile(game.discardPile);
    setCanvasZones(game.canvas || game.elements);
    setHand(game.players[playerIndex]?.hand || []);
    setPlayedCards(game.playedCards || []);
  };

  const postAction = async (type: string, extra: Record<string, any> = {}) => {
    if (!sessionId) return;

    const payload = {
      type,
      playerIndex,
      ...extra,
    };

    console.log('Posting action to backend:', payload);

    try {
      const res = await fetch(`http://localhost:5000/api/game/session/${sessionId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Server responded with status ${res.status}:`, errorText);
        throw new Error('Action failed');
      }

      const updated = await res.json();
      console.log('Received updated game state:', updated);
      syncWithBackend(updated);
    } catch (err) {
      console.error(`Error performing action "${type}"`, err);
    }
  };

  const handlePlayCard = (card: Card, pos: { x: number; y: number }) => {
    console.log('Attempting to play card:', card, 'at position:', pos);
    postAction('play_card', { cardId: card.id, position: pos });
  };

  const handleDrawCard = () => {
    console.log('Draw card clicked');
    postAction('draw_card');
  };

  const handleEndTurn = () => {
    console.log('End turn clicked');
    postAction('end_turn');
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
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-6">
        {hand.map((card) => (
          <img
            key={card.id}
            src={card.imageUrl}
            alt={card.name}
            className="h-32 shadow-md rounded border-2 border-white hover:scale-105 transition-transform"
            draggable
            onDragStart={() => {
              console.log('Dragging card:', card);
              setDraggedCard(card);
            }}
            onDragEnd={() => {
              console.log('Stopped dragging card');
              setDraggedCard(null);
            }}
          />
        ))}

        <button onClick={handleDrawCard} className="bg-blue-500 px-4 py-2 rounded ml-4">
          Draw Card
        </button>
        <button onClick={handleEndTurn} className="bg-red-500 px-4 py-2 rounded ml-2">
          End Turn
        </button>
      </div>
    </div>
  );
};

export default PlayPage;
