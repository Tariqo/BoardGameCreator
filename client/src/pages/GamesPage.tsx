import React from 'react';
import Layout from '../components/Layout/Layout'; // layout switcher + PlayerHand

const GamesPage = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Games Page</h2>

      {/* Layout switcher + player hands */}
      <Layout />

      {/* Game canvas */}

    </div>
  );
};

export default GamesPage;
