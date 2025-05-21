import React, { useState } from 'react';
import { useLayout } from '../../store/layoutStore';
import PlayerHand from './PlayerHand';

const Layout: React.FC = () => {
  const {
    currentLayout,
    setLayout,
    players,
    addPlayer,
    maxPlayers,
    setMaxPlayers,
  } = useLayout();

  const [newPlayerName, setNewPlayerName] = useState('');
  const isHorizontal = currentLayout === 'layout1';
  const flexDirection = isHorizontal ? 'row' : 'column';

  const handleAddPlayer = () => {
    const name = newPlayerName.trim();
    if (!name || players.length >= maxPlayers) return;
    addPlayer(name);
    setNewPlayerName('');
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setLayout('layout1')}
          style={{ marginRight: '1rem', fontWeight: isHorizontal ? 'bold' : 'normal' }}
        >
          Horizontal Layout
        </button>
        <button
          onClick={() => setLayout('layout2')}
          style={{ fontWeight: !isHorizontal ? 'bold' : 'normal' }}
        >
          Vertical Layout
        </button>
      </div>

      {/* Player controls */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="New player name"
          className="border px-2 py-1 rounded mr-2"
        />
        <button onClick={handleAddPlayer} disabled={players.length >= maxPlayers}>
          Add Player
        </button>
        <input
          type="number"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          min={1}
          max={10}
          className="border px-2 py-1 rounded ml-4"
        />
        <span style={{ marginLeft: '0.5rem' }}>Max Players</span>
      </div>

      {/* Render player hands */}
      <div style={{ display: 'flex', flexDirection, gap: '1rem', flexWrap: 'wrap' }}>
        {players.map((player) => (
          <PlayerHand key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
};

export default Layout;
