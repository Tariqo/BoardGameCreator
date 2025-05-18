import React from 'react';
import PlayerHand from '../components/Layout/PlayerHand';
import GameCanvas from '../components/GameEditor/GameCanvas';

const EditorPage = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Game Editor</h1>

      {/* Player hands */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <PlayerHand owner="Player A" />
        <PlayerHand owner="Player B" />
      </div>

      {/* Game canvas */}
      <GameCanvas />
    </div>
  );
};

export default EditorPage;
