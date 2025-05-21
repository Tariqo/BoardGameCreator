import React from 'react';
import { useLayout, PlayerName } from '../../store/layoutStore';
import PlayerHand from './PlayerHand';

const Layout: React.FC = () => {
  const { currentLayout, setLayout } = useLayout();

  const isHorizontal = currentLayout === 'layout1';
  const flexDirection = isHorizontal ? 'row' : 'column';

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Layout switch buttons */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setLayout('layout1')}
          style={{
            marginRight: '1rem',
            fontWeight: isHorizontal ? 'bold' : 'normal',
          }}
        >
          Horizontal Layout
        </button>
        <button
          onClick={() => setLayout('layout2')}
          style={{
            fontWeight: !isHorizontal ? 'bold' : 'normal',
          }}
        >
          Vertical Layout
        </button>
      </div>

      {/* Render player hands */}
      <h2>{isHorizontal ? 'Horizontal Layout' : 'Vertical Layout'}</h2>
      <div style={{ display: 'flex', flexDirection, gap: '1rem' }}>
        {(['Player A', 'Player B'] as PlayerName[]).map((player) => (
          <PlayerHand key={player} owner={player} />
        ))}
      </div>
    </div>
  );
};

export default Layout;
