import React, { useRef, useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';

interface EditorSidebarProps {
  onAdd?: (type: 'card' | 'text' | 'token') => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ onAdd }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  const startX = useRef(0);
  const startWidth = useRef(width);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      document.body.style.userSelect = 'none';
      const delta = e.clientX - startX.current;
      setWidth(Math.max(200, Math.min(500, startWidth.current + delta)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = width;
  };

  const [expanded, setExpanded] = useState({ A: false, B: false });
  const togglePlayer = (player: 'A' | 'B') =>
    setExpanded((prev) => ({ ...prev, [player]: !prev[player] }));

  return (
    <div
      ref={sidebarRef}
      style={{ width }}
      className="flex flex-col border-r bg-white p-4 space-y-6 overflow-auto relative"
    >
      <div>
        <h2 className="font-bold text-lg mb-2">Tools</h2>
        <div className="space-y-2">
          {['card', 'text', 'token'].map((type) => (
            <div
              key={type}
              draggable
              onDragStart={(e) => {
                const data = JSON.stringify({ name: `New ${type}`, type });
                e.dataTransfer.setData('application/json', data);
              }}
              className="cursor-move px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100 text-sm shadow-sm"
            >
              + {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {onAdd && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Quick Add (no drag)</p>
          {['card', 'text', 'token'].map((type) => (
            <button
              key={type}
              onClick={() => onAdd(type as 'card' | 'text' | 'token')}
              className="block w-full text-left px-3 py-1 text-sm text-green-700 hover:bg-green-100 rounded"
            >
              Add {type}
            </button>
          ))}
        </div>
      )}

      <div className="border-t pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Player Resources</h3>

        {['A', 'B'].map((player) => (
          <div key={player} className="space-y-1">
            <button
              onClick={() => togglePlayer(player as 'A' | 'B')}
              className="w-full text-left text-sm font-medium text-blue-700 px-2 py-1 hover:bg-blue-50 rounded"
            >
              {expanded[player as 'A' | 'B'] ? `▼ Player ${player}` : `► Player ${player}`}
            </button>
            {expanded[player as 'A' | 'B'] && (
              <div className="ml-2 mt-1">
                <PlayerHand owner={player === 'A' ? 'Player A' : 'Player B'} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-gray-400 z-10"
      />
    </div>
  );
};

export default EditorSidebar;
