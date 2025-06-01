// src/components/Layout/Header.tsx
import React from 'react';
import { FileText, LayoutDashboard, Layers, Upload } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button className="text-gray-700 font-semibold text-lg">Table Top Studio</button>
        <div className="flex items-center gap-6 text-gray-600 text-sm">
          <button className="flex items-center gap-1 hover:text-black">
            <FileText className="w-4 h-4" />
            Note
          </button>
          <button className="flex items-center gap-1 hover:text-black">
            <Layers className="w-4 h-4" />
            Components
          </button>
          <button className="flex items-center gap-1 hover:text-black">
            <LayoutDashboard className="w-4 h-4" />
            Arrange
          </button>
        </div>
      </div>

      {/* Right section */}
      <button className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-purple-700">
        <Upload className="w-4 h-4" />
        Publish
      </button>
    </header>
  );
};

export default Header;
