import React from 'react';
import { Search } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useAuth } from '../../context/AuthContext';
import NotificationsMenu from './NotificationsMenu';

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

const ProfileTopbar: React.FC<Props> = ({ search, setSearch }) => {
  const { user } = useAuth();
  const { wsRef } = useWebSocket();

  return (
    <header className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search className="absolute top-1.5 right-3 text-gray-400" size={18} />
      </div>

      {user && <NotificationsMenu wsRef={wsRef} />}
    </header>
  );
};

export default ProfileTopbar;
