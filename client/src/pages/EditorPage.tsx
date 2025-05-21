import React from 'react';
import PlayerHand from '../components/Layout/PlayerHand';
import GameCanvas from '../components/GameEditor/GameCanvas';
import AppShell from '../components/Layout/AppShell';
import RightPanel from '../components/Layout/RightPanel';

const EditorPage = () => {
  return (
    <AppShell>
      <div className="flex flex-col lg:flex-row h-full w-full">
        <div className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-bold">Game Editor</h1>

          {/* Player hands */}
          <div className="flex flex-wrap gap-6">
            <PlayerHand owner="Player A" />
            <PlayerHand owner="Player B" />
          </div>

          {/* Game canvas */}
          <div className="mt-6">
            <GameCanvas />
          </div>
        </div>

      </div>
    </AppShell>
  );
};

export default EditorPage;
