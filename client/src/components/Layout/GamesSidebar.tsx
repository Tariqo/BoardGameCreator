// src/components/Layout/GamesSidebar.tsx
import React from 'react';

interface GamesSidebarProps {
  onTagClick: (tag: string) => void;
}

const GamesSidebar: React.FC<GamesSidebarProps> = ({ onTagClick }) => {
  const tags = ['Strategy', 'Card', 'Dice', 'Party', 'Solo'];

  return (
    <aside className="w-64 border-r bg-white p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Tags</h2>
        <ul className="space-y-1 text-sm">
          {tags.map((tag) => (
            <li
              key={tag}
              className="text-gray-600 hover:underline cursor-pointer"
              onClick={() => onTagClick(tag)}
            >
              #{tag}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default GamesSidebar;
