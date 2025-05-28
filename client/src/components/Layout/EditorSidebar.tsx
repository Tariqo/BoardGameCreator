import React, { useRef, useState, useEffect } from 'react';
import RuleSetEditor, { RuleSet } from '../GameEditor/RuleSetEditor';

interface EditorSidebarProps {
  onAdd?: (type: 'card' | 'text' | 'token') => void;
  onUploadSprite: (src: string) => void;
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
  onSaveGame,
}) => {
  const [width, setWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(width);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gameplayMode, setGameplayMode] = useState<'dice' | 'cards'>('cards');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [useTeams, setUseTeams] = useState(false);
  const [maxPlayers] = useState(4);

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
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput('');
    }
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
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs text-gray-600 block mb-1">Tags (press Enter to add)</label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full border px-2 py-1 text-sm rounded"
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
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
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({ name: 'Draw Pile Zone', type: 'drawZone' })
              )
            }
            className="cursor-move px-3 py-2 border rounded bg-green-100 hover:bg-green-200 text-sm shadow-sm"
          >
            + Draw Pile Zone
          </button>
          <button
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({ name: 'Discard Pile Zone', type: 'discardZone' })
              )
            }
            className="cursor-move px-3 py-2 border rounded bg-yellow-100 hover:bg-yellow-200 text-sm shadow-sm"
          >
            + Discard Pile Zone
          </button>
          <button
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({ name: 'Card Play Area', type: 'placementZone' })
              )
            }
            className="cursor-move px-3 py-2 border rounded bg-purple-100 hover:bg-purple-200 text-sm shadow-sm"
          >
            + Card Play Area
          </button>
        </div>
      </div>

      {/* Rule Set Editor */}
      <RuleSetEditor
        gameplayMode={gameplayMode}
        maxPlayers={maxPlayers}
        useTeams={useTeams}
        tags={tags}
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
