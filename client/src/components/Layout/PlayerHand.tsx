import React, { useState } from 'react';
import { useLayout } from '../../store/layoutStore';

export interface PlayerHandProps {
  owner: 'Player A' | 'Player B';
}

const PlayerHand: React.FC<PlayerHandProps> = ({ owner }) => {
  const { playerCards, addCard, updateCard, deleteCard } = useLayout();
 const cards = playerCards[owner].length
  ? playerCards[owner]
  : [{ id: 1, name: 'Wood', count: 2 }];

  const [resourceName, setResourceName] = useState<string>('');

  const handleAdd = () => {
    if (!resourceName.trim()) return;

    const exists = cards.some(card => card.name.toLowerCase() === resourceName.toLowerCase());
    if (exists) return;

    const newCard = {
      id: Date.now(),
      name: resourceName,
      count: 1,
    };
    addCard(owner, newCard);
    setResourceName('');
  };

  return (
    <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>
      <h3>{owner}'s Resources</h3>
      {cards.map(card => (
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
              console.log('Dragging:', card);
              e.dataTransfer.setData('application/json', JSON.stringify(card));
            }}
            style={{
              cursor: 'grab',
              paddingBottom: '0.2rem',
            }}
          >
            <strong>{card.name}</strong>: {card.count}
          </div>

          {/* Buttons are outside the drag zone */}
          <button onClick={() => updateCard(owner, card.id, +1)} style={{ marginLeft: '0.5rem' }}>+</button>
          <button onClick={() => updateCard(owner, card.id, -1)} style={{ marginLeft: '0.3rem' }}>-</button>
          <button onClick={() => deleteCard(owner, card.id)} style={{ marginLeft: '0.3rem', color: 'red' }}>❌</button>
        </div>
      ))}


      <div style={{ marginTop: '1rem' }}>
      <input
        type="text"
        value={resourceName}
        onChange={(e) => setResourceName(e.target.value)}
        className="w-full border px-2 py-1 rounded text-sm"
      />

        <button onClick={handleAdd} style={{ marginLeft: '0.5rem' }}>Add Resource</button>
      </div>
    </div>
  );
};

export default PlayerHand;
