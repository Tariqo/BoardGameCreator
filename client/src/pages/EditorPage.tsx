import React, { useEffect, useState } from 'react';
import PlayerHand from '../components/Layout/PlayerHand';
import GameCanvas from '../components/GameEditor/GameCanvas';
import AppShell from '../components/Layout/AppShell';
import { v4 as uuid } from 'uuid';

type BoardElement = {
  id: string;
  name: string;
  type: 'card' | 'text' | 'token';
  x: number;
  y: number;
};

const EditorPage = () => {
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Add a new element manually (via sidebar click)
  const addElement = (type: 'card' | 'text' | 'token') => {
    setElements((prev) => [
      ...prev,
      {
        id: uuid(),
        name: `New ${type}`,
        type,
        x: 150,
        y: 100,
      },
    ]);
  };

  // Update element position on drag end
  const handleElementMove = (id: string, x: number, y: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  // Handle element drop from sidebar
  const handleElementDrop = (
    dropped: Omit<BoardElement, 'id'>,
    position: { x: number; y: number }
  ) => {
    setElements((prev) => [
      ...prev,
      {
        id: uuid(),
        name: dropped.name,
        type: dropped.type,
        x: position.x,
        y: position.y,
      },
    ]);
  };

  // Delete selected element with keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        setElements((prev) => prev.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  return (
    <AppShell onAdd={addElement}>
      <h1 className="text-2xl font-bold">Game Editor</h1>

      <div className="flex flex-wrap gap-6">
        <PlayerHand owner="Player A" />
        <PlayerHand owner="Player B" />
      </div>

      <div className="mt-6 border border-gray-300 bg-white rounded-md shadow-md h-[500px] relative">
        <GameCanvas
          elements={elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onElementMove={handleElementMove}
          onElementDrop={handleElementDrop}
        />
      </div>
    </AppShell>
  );
};

export default EditorPage;
