import React, { useEffect, useState } from 'react';
import GameCanvas from '../components/GameEditor/GameCanvas';
import RightPanel from '../components/Layout/RightPanel';
import EditorTopbar from '../components/Layout/EditorTopbar';
import EditorSidebar from '../components/Layout/EditorSidebar';
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
  const [showRightPanel, setShowRightPanel] = useState(true);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

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

  const handleElementMove = (id: string, x: number, y: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

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

  const updateElement = (id: string, updated: Partial<BoardElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updated } : el))
    );
  };

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
    <div className="flex flex-col h-screen">
      <EditorTopbar
        isRightPanelVisible={showRightPanel}
        onToggleRightPanel={() => setShowRightPanel((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar onAdd={addElement} />

        <main className="flex-1 flex flex-col overflow-auto bg-gray-50">
          <div className="p-6 flex flex-col min-h-full">
            <h1 className="text-2xl font-bold mb-4">Game Editor</h1>

            <div className="flex-1 min-h-[800px] border border-gray-300 bg-white rounded-md shadow-md relative">
              <GameCanvas
                elements={elements}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onElementMove={handleElementMove}
                onElementDrop={handleElementDrop}
                panelVisible={showRightPanel}
              />
            </div>
          </div>
        </main>

        {showRightPanel && (
          <RightPanel
            selectedElement={selectedElement}
            onUpdate={(updated) => {
              if (selectedId) updateElement(selectedId, updated);
            }}
            onClose={() => setShowRightPanel(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPage;
