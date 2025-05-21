import React from 'react';

interface EditorSidebarProps {
  onAdd?: (type: 'card' | 'text' | 'token') => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ onAdd }) => {
  const handleDragStart = (type: 'card' | 'text' | 'token') => (
    e: React.DragEvent
  ) => {
    const data = JSON.stringify({ name: `New ${type}`, type });
    e.dataTransfer.setData('application/json', data);
  };

  return (
    <aside className="w-64 border-r bg-white p-4 space-y-4">
      <h2 className="font-bold text-lg">Tools</h2>
      <div className="space-y-2">
        {['card', 'text', 'token'].map((type) => (
          <div
            key={type}
            draggable
            onDragStart={handleDragStart(type as 'card' | 'text' | 'token')}
            className="cursor-move px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100 text-sm shadow-sm"
          >
            + {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
      </div>

      {onAdd && (
        <div className="mt-6">
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
    </aside>
  );
};

export default EditorSidebar;
