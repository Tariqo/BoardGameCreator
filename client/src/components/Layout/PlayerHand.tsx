import React, { useState } from 'react';

interface Card {
  id: number;
  name: string;
  count: number;
}

interface Player {
  id: string;
  name: string;
  hand: Card[];
  rules: string[];
}

interface PlayerHandProps {
  player: Player;
  onUpdateHand: (playerId: string, newHand: Card[]) => void;
  onAddRule: (playerId: string, rule: string) => void;
  onRemoveRule: (playerId: string, ruleIndex: number) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  onUpdateHand,
  onAddRule,
  onRemoveRule,
}) => {
  const [newCard, setNewCard] = useState('');
  const [newRule, setNewRule] = useState('');

  const handleAddCard = () => {
    if (!newCard.trim()) return;
    const newCardObj: Card = {
      id: Date.now(),
      name: newCard.trim(),
      count: 1,
    };
    const updatedHand = [...player.hand, newCardObj];
    onUpdateHand(player.id, updatedHand);
    setNewCard('');
  };

  const handleRemoveCard = (index: number) => {
    const updatedHand = player.hand.filter((_, i) => i !== index);
    onUpdateHand(player.id, updatedHand);
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    onAddRule(player.id, newRule.trim());
    setNewRule('');
  };

  return (
    <div className="space-y-3">
      {/* Player Hand */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600">Hand</h4>
        <div className="space-y-1">
          {player.hand.map((card, i) => (
            <div key={card.id} className="flex justify-between items-center text-sm">
              <span>{card.name} ×{card.count}</span>
              <button
                onClick={() => handleRemoveCard(i)}
                className="text-red-500 text-xs hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex mt-1 gap-2">
          <input
            type="text"
            value={newCard}
            onChange={(e) => setNewCard(e.target.value)}
            className="w-full border px-2 py-1 rounded text-sm"
            placeholder="Add card name"
          />
          <button
            onClick={handleAddCard}
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Player Rules */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600">Rules</h4>
        <div className="space-y-1">
          {player.rules.map((rule, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span>{rule}</span>
              <button
                onClick={() => onRemoveRule(player.id, i)}
                className="text-red-500 text-xs hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex mt-1 gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            className="w-full border px-2 py-1 rounded text-sm"
            placeholder="New rule"
          />
          <button
            onClick={handleAddRule}
            className="bg-green-500 text-white px-2 py-1 rounded text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerHand;
