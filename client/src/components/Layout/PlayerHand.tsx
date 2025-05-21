import React, { useState } from 'react';
import { useLayout } from '../../store/layoutStore';
import { Player } from '../../store/layoutStore';

export interface PlayerHandProps {
  player: Player;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ player }) => {
  const {
    addCardToPlayer,
    updatePlayerCard,
    removePlayerCard,
  } = useLayout();

  const [resourceName, setResourceName] = useState<string>('');

  const cards = player.hand;

  const handleAdd = () => {
    if (!resourceName.trim()) return;

    const exists = cards.some(
      (card) => card.name.toLowerCase() === resourceName.toLowerCase()
    );
    if (exists) return;

    const newCard = {
      id: Date.now(),
      name: resourceName,
      count: 1,
    };

    addCardToPlayer(player.id, newCard);
    setResourceName('');
  };

  return (
    <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>
      <h3>{player.name}'s Resources</h3>
      {cards.map((card) => (
        <div
          key={card.id}
          style={{
            marginBottom: '0.5rem',
            padding: '0.25rem',
            border: '1px solid gray',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/json', JSON.stringify(card));
            }}
            style={{ cursor: 'grab', paddingBottom: '0.2rem' }}
          >
            <strong>{card.name}</strong>: {card.count}
          </div>

          <button
            onClick={() => updatePlayerCard(player.id, card.id, +1)}
            style={{ marginLeft: '0.5rem' }}
          >
            +
          </button>
          <button
            onClick={() => updatePlayerCard(player.id, card.id, -1)}
            style={{ marginLeft: '0.3rem' }}
          >
            -
          </button>
          <button
            onClick={() => removePlayerCard(player.id, card.id)}
            style={{ marginLeft: '0.3rem', color: 'red' }}
          >
            ❌
          </button>
        </div>
      ))}

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={resourceName}
          onChange={(e) => setResourceName(e.target.value)}
          className="w-full border px-2 py-1 rounded text-sm"
        />
        <button onClick={handleAdd} style={{ marginLeft: '0.5rem' }}>
          Add Resource
        </button>
      </div>
    </div>
  );
};

export default PlayerHand;
