import React, { useRef, useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';
import RuleSetEditor, { RuleSet } from '../GameEditor/RuleSetEditor';
import { useLayout } from '../../store/layoutStore';

interface EditorSidebarProps {
  onAdd?: (type: 'card' | 'text' | 'token') => void;
  onUploadSprite: (src: string) => void;
  onZoneModeChange?: (mode: 'draw' | 'discard' | null) => void;
  onSaveGame: (ruleSet: RuleSet) => void;
}

interface UploadedImage {
  id: string;
  name: string;
  url: string;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  onAdd,
  onUploadSprite,
  onZoneModeChange,
  onSaveGame,
}) => {
  const [width, setWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(width);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showUploads, setShowUploads] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [expandedPlayers, setExpandedPlayers] = useState<Record<string, boolean>>({});
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameplayMode, setGameplayMode] = useState<'dice' | 'cards'>('cards');

  const {
    players,
    addPlayer,
    maxPlayers,
    setMaxPlayers,
    updatePlayerCard,
    addPlayerRule,
    removePlayerRule,
  } = useLayout();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = width;
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const image: UploadedImage = {
          id: crypto.randomUUID(),
          name: file.name,
          url: reader.result,
        };
        onUploadSprite(image.url);
        setUploadedImages((prev) => [...prev, image]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageDragStart = (e: React.DragEvent, image: UploadedImage) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        name: image.name,
        type: 'token',
        imageUrl: image.url,
      })
    );
  };

  const togglePlayer = (id: string) => {
    setExpandedPlayers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddPlayer = () => {
    const name = newPlayerName.trim();
    if (!name || players.length >= maxPlayers) return;
    addPlayer(name);
    setNewPlayerName('');
  };

  return (
    <div
      style={{ width }}
      className="flex flex-col border-r bg-white p-4 space-y-6 overflow-auto relative"
    >
      {/* Gameplay Mode */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Gameplay Mode</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setGameplayMode('cards')}
            className={`flex-1 px-2 py-1 rounded text-sm ${
              gameplayMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Tile/Card
          </button>
          <button
            onClick={() => setGameplayMode('dice')}
            className={`flex-1 px-2 py-1 rounded text-sm ${
              gameplayMode === 'dice' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Dice Rolls
          </button>
        </div>

        {gameplayMode === 'cards' && (
          <div className="space-y-2 mt-2">
            <button
              onClick={() => onZoneModeChange?.('draw')}
              className="w-full bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-sm"
            >
              Set Draw Pile Area
            </button>
            <button
              onClick={() => onZoneModeChange?.('discard')}
              className="w-full bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded text-sm"
            >
              Set Discard Pile Area
            </button>
          </div>
        )}
      </div>

      {/* Tools */}
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

        <div className="mt-4 space-y-2">
          <button
            onClick={() => setShowUploads((prev) => !prev)}
            className="w-full px-3 py-2 bg-gray-200 text-gray-900 rounded text-sm hover:bg-gray-300"
          >
            {showUploads ? 'Hide Uploaded Sprites' : 'Uploaded Sprites'}
          </button>

          {showUploads && (
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  className="border rounded p-1 bg-white shadow hover:bg-gray-100 cursor-move"
                  draggable
                  onDragStart={(e) => handleImageDragStart(e, image)}
                >
                  <img src={image.url} alt={image.name} className="w-full h-auto rounded" />
                  <p className="text-xs mt-1 truncate">{image.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player Management */}
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Player Management</h3>
        <div className="space-y-2">
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            min={1}
            max={20}
            className="w-full border px-2 py-1 text-sm rounded"
            placeholder="Max players"
          />
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="w-full border px-2 py-1 text-sm rounded"
            placeholder="New player name"
          />
          <button
            onClick={handleAddPlayer}
            disabled={players.length >= maxPlayers}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-sm rounded"
          >
            Add Player
          </button>
        </div>
      </div>

      {/* Player Hands */}
      <div className="border-t pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Player Resources</h3>
        {players.map((player) => (
          <div key={player.id} className="space-y-1">
            <button
              onClick={() => togglePlayer(player.id)}
              className="w-full text-left text-sm font-medium text-blue-700 px-2 py-1 hover:bg-blue-50 rounded"
            >
              {expandedPlayers[player.id] ? `▼ ${player.name}` : `► ${player.name}`}
            </button>
            {expandedPlayers[player.id] && (
              <div className="ml-2 mt-1">
                <PlayerHand
                  player={player}
                  onUpdateHand={(id, newHand) => {
                    const updated = newHand.map((name, i) => ({
                      id: Date.now() + i,
                      name,
                      count: 1,
                    }));
                    updated.forEach((card) => {
                      updatePlayerCard(id, card.id, card.count);
                    });
                  }}
                  onAddRule={addPlayerRule}
                  onRemoveRule={removePlayerRule}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rule Set Editor */}
      <RuleSetEditor
        gameplayMode={gameplayMode}
        maxPlayers={maxPlayers}
        onSave={onSaveGame}
      />

      {/* Upload Button */}
      <div className="mt-auto pt-4 border-t">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Upload Sprite
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-gray-400 z-10"
      />
    </div>
  );
};

export default EditorSidebar;
