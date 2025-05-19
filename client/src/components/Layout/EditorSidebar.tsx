// src/components/Layout/EditorSidebar.tsx
import React from 'react';
import {
  Wrench,
  Image as ImageIcon,
  List,
  Users,
  SlidersHorizontal,
  Menu,
} from 'lucide-react';

const EditorSidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-16 bg-gray-100 border-r text-center">
      <div className="flex items-center justify-center h-14 border-b">
        <Menu className="w-5 h-5" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-start gap-6 py-4 text-muted-foreground">
        <button className="hover:text-black" title="Tools">
          <Wrench className="w-5 h-5" />
        </button>
        <button className="hover:text-black" title="Sprites">
          <ImageIcon className="w-5 h-5" />
        </button>
        <button className="hover:text-black" title="Game Rules">
          <List className="w-5 h-5" />
        </button>
        <button className="hover:text-black" title="Players">
          <Users className="w-5 h-5" />
        </button>
        <button className="hover:text-black" title="Settings">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default EditorSidebar;
