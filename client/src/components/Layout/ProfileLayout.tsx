// src/components/Layout/ProfileLayout.tsx

import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import ProfileTopbar from './ProfileTopbar';

interface Props {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

const ProfileLayout: React.FC<Props> = ({ children, rightPanel }) => {
  return (
    <div className="flex h-screen">
      <ProfileSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <ProfileTopbar />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto bg-gray-50 p-6">
            {children}
          </main>

          {rightPanel && (
            <aside className="w-80 border-l bg-white p-4 overflow-auto">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
