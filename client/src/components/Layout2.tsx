import React from 'react';
import PlayerHand from './PlayerHand';
import { PlayerName } from '../store/layoutStore';

const Layout2: React.FC = () => {
  return (
    <div>
      <h2>Vertical Layout</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(['Player A', 'Player B'] as PlayerName[]).map((player) => (
          <PlayerHand key={player} owner={player} />
        ))}
      </div>
    </div>
  );
};

export default Layout2;
