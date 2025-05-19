import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import RightPanel from './RightPanel';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showRightPanel, setShowRightPanel] = useState(true);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className={`transition-all duration-300 ${showRightPanel ? 'w-full' : 'flex-1'} overflow-auto p-4 bg-gray-50`}>
          {children}
        </main>
        {showRightPanel && (
          <RightPanel onClose={() => setShowRightPanel(false)} />
        )}
        {!showRightPanel && (
          <button
            onClick={() => setShowRightPanel(true)}
            className="absolute top-16 right-0 z-50 bg-purple-600 text-white px-3 py-1 rounded-l shadow"
          >
            Show Settings
          </button>
        )}
      </div>
    </div>
  );
};

export default AppShell;
