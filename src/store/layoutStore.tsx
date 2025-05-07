import React, { createContext, useContext, useState, ReactNode } from 'react';

type LayoutType = 'layout1' | 'layout2';

interface LayoutContextProps {
  currentLayout: LayoutType;
  setLayout: (layout: LayoutType) => void;
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('layout1');

  return (
    <LayoutContext.Provider value={{ currentLayout, setLayout: setCurrentLayout }}>
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
