import React from 'react';
import { Card } from './DeckBuilder';

interface PlayerHandDisplayProps {
  cards: Card[];
  onDiscard?: (cardId: string) => void;
}

const PlayerHandDisplay: React.FC<PlayerHandDisplayProps> = ({ cards, onDiscard }) => {
  return (
    <div className="p-4 bg-white rounded shadow-md space-y-2">
      <h3 className="font-bold text-lg">Current Player's Hand</h3>
      <div className="flex gap-2 overflow-x-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            className="border p-2 rounded cursor-pointer hover:bg-gray-100"
            onClick={() => onDiscard?.(card.id)}
          >
            {card.imageUrl ? (
              <img src={card.imageUrl} alt={card.name} className="w-16 h-24 object-cover" />
            ) : (
              <div className="w-16 h-24 flex items-center justify-center bg-gray-200 text-sm">
                {card.name}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600">{cards.length} card(s) in hand.</p>
    </div>
  );
};

export default PlayerHandDisplay;
