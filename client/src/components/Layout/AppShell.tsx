import React, { useState } from 'react';
import EditorSidebar from './EditorSidebar';
import EditorTopbar from './EditorTopbar';
import RightPanel from './RightPanel';

interface AppShellProps {
  children: React.ReactNode;
  onAdd?: (type: 'card' | 'text' | 'token') => void;
}

const AppShell: React.FC<AppShellProps> = ({ children, onAdd }) => {
  const [showRightPanel, setShowRightPanel] = useState(true);

  return (
    <div className="flex flex-col h-screen">
      <EditorTopbar
        isRightPanelVisible={showRightPanel}
        onToggleRightPanel={() => setShowRightPanel((prev: boolean) => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar onAdd={onAdd} />
        <main
          className={`transition-all duration-300 ${
            showRightPanel ? 'w-full' : 'flex-1'
          } overflow-auto p-4 bg-gray-50`}
        >
          {children}
        </main>
        {showRightPanel && (
          <RightPanel
            selectedElement={null}
            onUpdate={() => {}}
            onClose={() => setShowRightPanel(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AppShell;
