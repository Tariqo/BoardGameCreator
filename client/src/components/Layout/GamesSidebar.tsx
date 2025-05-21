// src/components/Layout/GamesSidebar.tsx
import React from 'react';

const GamesSidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r bg-white p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Tags</h2>
        <ul className="space-y-1 text-sm">
          {['Strategy', 'Card', 'Dice', 'Party', 'Solo'].map((tag) => (
            <li key={tag} className="text-gray-600 hover:underline cursor-pointer">
              #{tag}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Saved</h2>
        <ul className="space-y-2 text-sm">
          <li className="hover:underline text-green-700 cursor-pointer">Saved Projects</li>
          <li className="hover:underline text-green-700 cursor-pointer">Saved Games</li>
        </ul>
      </div>
    </aside>
  );
};

export default GamesSidebar;
