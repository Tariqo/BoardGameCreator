import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define layout types
type LayoutType = 'layout1' | 'layout2';

// Define player names
export type PlayerName = 'Player A' | 'Player B';

// Define card structure
export interface Card {
  id: number;
  name: string;
  count: number;
}

// Define the context value type
interface LayoutContextProps {
  currentLayout: LayoutType;
  setLayout: (layout: LayoutType) => void;
  playerCards: Record<PlayerName, Card[]>;
  addCard: (player: PlayerName, card: Card) => void;
  updateCard: (player: PlayerName, cardId: number, delta: number) => void;
  deleteCard: (player: PlayerName, cardId: number) => void;
}

// Define the props type for the provider component
interface LayoutProviderProps {
  children: ReactNode;
}

// Create context with default value undefined
const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

// Define the provider component
export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('layout1');

  const [playerCards, setPlayerCards] = useState<Record<PlayerName, Card[]>>({
    'Player A': [],
    'Player B': [],
  });

  // Add a new card to the player's hand
  const addCard = (player: PlayerName, card: Card) => {
    setPlayerCards((prev) => ({
      ...prev,
      [player]: [...prev[player], card],
    }));
  };

  // Update card count by delta
  const updateCard = (player: PlayerName, cardId: number, delta: number) => {
    setPlayerCards((prev) => ({
      ...prev,
      [player]: prev[player].map((card) =>
        card.id === cardId ? { ...card, count: card.count + delta } : card
      ),
    }));
  };

  // Delete a card
  const deleteCard = (player: PlayerName, cardId: number) => {
    setPlayerCards((prev) => ({
      ...prev,
      [player]: prev[player].filter((card) => card.id !== cardId),
    }));
  };

  return (
    <LayoutContext.Provider
      value={{
        currentLayout,
        setLayout: setCurrentLayout,
        playerCards,
        addCard,
        updateCard,
        deleteCard,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

// Custom hook to use the layout context
export const useLayout = (): LayoutContextProps => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
