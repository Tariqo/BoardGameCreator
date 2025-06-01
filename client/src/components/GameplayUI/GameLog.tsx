import React from 'react';

interface GameLogProps {
  logs: string[];
}   

const GameLog: React.FC<GameLogProps> = ({ logs }) => (
  <div className="absolute bottom-4 right-4 w-80 h-48 bg-black bg-opacity-40 text-xs text-white p-2 rounded overflow-y-auto shadow-lg">
    <div className="font-bold mb-1">Game Log</div>
    {logs.map((log, idx) => (
      <div key={idx} className="whitespace-pre-wrap">{log}</div>
    ))}
  </div>
);

export default GameLog;
