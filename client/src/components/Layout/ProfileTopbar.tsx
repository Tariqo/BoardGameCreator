import React from 'react';
import { Bell, Search } from 'lucide-react';

const ProfileTopbar: React.FC = () => {
  return (
    <header className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search"
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search className="absolute top-1.5 right-3 text-gray-400" size={18} />
      </div>

      {/* Notifications */}
      <div className="relative ml-4">
        <Bell className="text-gray-500" />
        <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1.5">
          4
        </span>
      </div>
    </header>
  );
};

export default ProfileTopbar;
