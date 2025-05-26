import React, { useRef, useState, useEffect } from 'react';
import EffectsEditor from '../GameEditor/EffectsEditor';
import ConditionsEditor, { Condition } from '../GameEditor/ConditionsEditor';
import { Effect } from '../types/Effect';
import { Card } from '../GameEditor/DeckBuilder';
import { BoardElement as CanvasElement } from '../types/BoardElement';


interface RightPanelProps {
  selectedElement: CanvasElement | null;
  selectedCard: Card | null;
  onUpdate: (updated: Partial<any>) => void;
  onClose: () => void;
}

const MIN_WIDTH = 200;
const DEFAULT_WIDTH = 320;

const RightPanel: React.FC<RightPanelProps> = ({
  selectedElement,
  selectedCard,
  onUpdate,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(width);
  const [tagInput, setTagInput] = useState('');

  const target = selectedCard ?? selectedElement;
  const isCanvasElement = target && 'type' in target && 'x' in target;

  const [localTarget, setLocalTarget] = useState<any>(target);

  useEffect(() => {
    setLocalTarget(target);
  }, [target]);

  const updateLocal = (updates: Partial<any>) => {
    const updated = { ...localTarget, ...updates };
    setLocalTarget(updated);
    onUpdate(updates);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.max(MIN_WIDTH, startWidth.current + delta);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.classList.remove('select-none');
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const startResize = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.classList.add('select-none');
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !localTarget) return;
    const newTag = tagInput.trim();
    const existing = localTarget.tags || [];
    if (!existing.includes(newTag)) {
      updateLocal({ tags: [...existing, newTag] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!localTarget) return;
    const existing = localTarget.tags || [];
    updateLocal({ tags: existing.filter((t: string) => t !== tagToRemove) });
  };

  return (
    <div
      ref={panelRef}
      style={{ width }}
      className="bg-white shadow-sm border-l relative overflow-auto transition-all"
    >
      <div
        onMouseDown={startResize}
        className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-gray-300 opacity-50 hover:opacity-100 z-10"
      />

      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {selectedCard ? 'Card Properties' : 'Element Properties'}
          </h2>
          <button onClick={onClose} className="text-sm text-red-500">
            ✕
          </button>
        </div>

        {localTarget ? (
          <div className="space-y-4 text-sm">
            <div>
              <label className="block font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={localTarget.name}
                onChange={(e) => updateLocal({ name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {isCanvasElement && (
              <>
                <div>
                  <label className="block font-medium text-gray-700">Type</label>
                  <div className="mt-1 text-gray-800 capitalize">{localTarget.type}</div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700">Position</label>
                  <div className="mt-1 text-gray-700">
                    x: {Math.round(localTarget.x)} <br />
                    y: {Math.round(localTarget.y)}
                  </div>
                </div>
              </>
            )}

          {(isCanvasElement && localTarget.type !== 'text') || selectedCard ? (
            <EffectsEditor
              effects={localTarget.effects || []}
              onChange={(updated) => updateLocal({ effects: updated })}
            />
          ) : null}

            {(isCanvasElement && localTarget.type === 'card') || selectedCard ? (
              <>
                <ConditionsEditor
                  title="Play Conditions"
                  conditions={localTarget.playConditions || []}
                  onChange={(updated) => updateLocal({ playConditions: updated })}
                />

                <div>
                  <label className="block font-medium text-gray-700">Tags</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="border px-2 py-1 rounded w-full"
                      placeholder="Enter tag and press Enter"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(localTarget.tags || []).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {isCanvasElement && localTarget.type === 'token' && (
              <div>
                <label className="block font-medium text-gray-700">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      updateLocal({ imageUrl: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="mt-1 block text-sm"
                />
              </div>
            )}

            {localTarget.imageUrl && (
              <div key={localTarget.imageUrl}>
                <label className="block font-medium text-gray-700 mb-1">Image Preview</label>
                <div className="w-32 h-32 border rounded overflow-hidden bg-gray-100">
                  <img
                    src={localTarget.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No element selected</p>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
