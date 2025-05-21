import { useState } from 'react';

type Direction = 'clockwise' | 'counterclockwise';

export interface Player {
  id: string;
  name: string;
}

export const useTurnManager = (players: Player[]) => {
  const [turnIndex, setTurnIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>('clockwise');

  const currentPlayer = players[turnIndex];

  const nextTurn = (skip = 0) => {
    const dir = direction === 'clockwise' ? 1 : -1;
    const nextIndex = (turnIndex + dir * (1 + skip) + players.length) % players.length;
    setTurnIndex(nextIndex);
  };

  const reverseDirection = () => {
    setDirection(prev => (prev === 'clockwise' ? 'counterclockwise' : 'clockwise'));
  };

  const reset = () => {
    setTurnIndex(0);
    setDirection('clockwise');
  };

  return {
    currentPlayer,
    direction,
    turnIndex,
    nextTurn,
    reverseDirection,
    reset,
  };
};
