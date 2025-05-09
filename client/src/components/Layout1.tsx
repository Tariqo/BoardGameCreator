import React from 'react';
import PlayerHand from './PlayerHand';
import { PlayerName } from '../store/layoutStore';

const Layout1: React.FC = () => {
  return (
    <div>
      <h2>Horizontal Layout</h2>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
        {(['Player A', 'Player B'] as PlayerName[]).map((player) => (
          <PlayerHand key={player} owner={player} />
        ))}
      </div>
    </div>
  );
};

export default Layout1;
