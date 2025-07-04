import React, { createContext, useContext, useState, ReactNode } from 'react';

type LayoutType = 'layout1' | 'layout2';

export interface Card {
  id: number;
  name: string;
  count: number;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  rules: string[];
}

interface LayoutContextProps {
  currentLayout: LayoutType;
  setLayout: (layout: LayoutType) => void;

  players: Player[];
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  addCardToPlayer: (playerId: string, card: Card) => void;
  updatePlayerCard: (playerId: string, cardId: number, delta: number) => void;
  removePlayerCard: (playerId: string, cardId: number) => void;
  replacePlayerHand: (playerId: string, newHand: Card[]) => void;

  drawPile: Card[];
  discardPile: Card[];
  drawCard: (playerId: string) => void;
  playCard: (playerId: string, cardId: number) => void;

  addPlayerRule: (playerId: string, rule: string) => void;
  removePlayerRule: (playerId: string, ruleIndex: number) => void;

  maxPlayers: number;
  setMaxPlayers: (count: number) => void;
}

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('layout1');
  const [players, setPlayers] = useState<Player[]>([]);
  const [drawPile, setDrawPile] = useState<Card[]>([
    { id: 1, name: 'Generic Card 1', count: 1 },
    { id: 2, name: 'Generic Card 2', count: 1 },
    { id: 3, name: 'Generic Card 3', count: 1 },
  ]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(4);

  const addPlayer = (name: string) => {
    if (players.length >= maxPlayers) return;
    setPlayers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, hand: [], rules: [] },
    ]);
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const addCardToPlayer = (playerId: string, card: Card) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, hand: [...p.hand, card] } : p
      )
    );
  };

  const updatePlayerCard = (playerId: string, cardId: number, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              hand: p.hand.map((card) =>
                card.id === cardId
                  ? { ...card, count: card.count + delta }
                  : card
              ),
            }
          : p
      )
    );
  };

  const removePlayerCard = (playerId: string, cardId: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, hand: p.hand.filter((card) => card.id !== cardId) }
          : p
      )
    );
  };

  const replacePlayerHand = (playerId: string, newHand: Card[]) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, hand: newHand } : p
      )
    );
  };

  const drawCard = (playerId: string) => {
    if (drawPile.length === 0) return;
    const [topCard, ...rest] = drawPile;
    setDrawPile(rest);
    addCardToPlayer(playerId, { ...topCard, id: Date.now() });
  };

  const playCard = (playerId: string, cardId: number) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const card = player.hand.find((c) => c.id === cardId);
    if (!card) return;

    removePlayerCard(playerId, cardId);
    setDiscardPile((prev) => [card, ...prev]);
  };

  const addPlayerRule = (playerId: string, rule: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, rules: [...p.rules, rule] } : p
      )
    );
  };

  const removePlayerRule = (playerId: string, ruleIndex: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, rules: p.rules.filter((_, i) => i !== ruleIndex) }
          : p
      )
    );
  };

  return (
    <LayoutContext.Provider
      value={{
        currentLayout,
        setLayout: setCurrentLayout,
        players,
        addPlayer,
        removePlayer,
        addCardToPlayer,
        updatePlayerCard,
        removePlayerCard,
        replacePlayerHand,
        drawPile,
        discardPile,
        drawCard,
        playCard,
        addPlayerRule,
        removePlayerRule,
        maxPlayers,
        setMaxPlayers,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutContextProps => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
