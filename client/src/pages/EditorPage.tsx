import React, { useEffect, useState } from 'react';
import GameCanvas from '../components/GameEditor/GameCanvas';
import RightPanel from '../components/Layout/RightPanel';
import EditorTopbar from '../components/Layout/EditorTopbar';
import EditorSidebar from '../components/Layout/EditorSidebar';
import { v4 as uuid } from 'uuid';
import { useUndoRedo } from '../hooks/useUndoRedo';

type BoardElement = {
  id: string;
  name: string;
  type: 'card' | 'text' | 'token';
  x: number;
  y: number;
  imageUrl?: string;
  width?: number;
  height?: number;
};

type ZoneMode = 'draw' | 'discard' | null;

const EditorPage = () => {
  const { state: elements, set: setElements, undo, redo } = useUndoRedo<BoardElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [zoneMode, setZoneMode] = useState<ZoneMode>(null); 
  

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  const addElement = (type: 'card' | 'text' | 'token') => {
    const newElement: BoardElement = {
      id: uuid(),
      name: `New ${type}`,
      type,
      x: 150,
      y: 100,
    };
    setElements([...elements, newElement]);
  };

  const handleElementMove = (id: string, x: number, y: number) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, x, y } : el)));
  };

  const handleElementDrop = (
    dropped: Omit<BoardElement, 'id'>,
    position: { x: number; y: number }
  ) => {
    const newElement: BoardElement = {
      id: uuid(),
      name: dropped.name,
      type: dropped.type,
      x: position.x,
      y: position.y,
      imageUrl: dropped.imageUrl,
      width: dropped.width,
      height: dropped.height,
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (id: string, updated: Partial<BoardElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updated } : el)));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          undo();
        }
        if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        }
      }

      if (e.key === 'Delete' && selectedId) {
        setElements(elements.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, undo, redo, setElements]);

  return (
    <div className="flex flex-col h-screen">
      <EditorTopbar
        isRightPanelVisible={showRightPanel}
        onToggleRightPanel={() => setShowRightPanel((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          onAdd={addElement}
          onUploadSprite={(src) => {
            if (elements.length === 0) return;
            const last = elements[elements.length - 1];
            updateElement(last.id, { imageUrl: src });
          }}
          onZoneModeChange={setZoneMode} // ✅ pass handler
        />

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
                updateElement={updateElement}
                panelVisible={showRightPanel}
                zoneMode={zoneMode} // ✅ pass current mode
                setZoneMode={setZoneMode}
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
