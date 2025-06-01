import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Gamepad2, Plus, Send, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../context/WebSocketContext';
import NotificationsMenu from './NotificationsMenu';

interface PlayTopbarProps {
  wsRef: React.MutableRefObject<WebSocket | null>;
  sessionId: string | undefined;
}

const PlayTopbar: React.FC<PlayTopbarProps> = ({ wsRef, sessionId }) => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useWebSocket();

  const [inviteUsername, setInviteUsername] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (usersRef.current && !usersRef.current.contains(e.target as Node)) {
        setUsersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'online_users' && Array.isArray(msg.users)) {
          setOnlineUsers(msg.users);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [wsRef]);

  const handleGuestLogin = () => {
    login('guest', { username: 'Guest' });
    navigate('/games');
  };

  const handleInvite = () => {
    setInviteError(null);
    
    if (!inviteUsername.trim()) {
      setInviteError('Please enter a username');
      return;
    }
    
    if (!sessionId) {
      setInviteError('No active game session');
      return;
    }
    
    if (!wsRef.current || !isConnected) {
      setInviteError('Not connected to server');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'invite',
        toUsername: inviteUsername.trim(),
        sessionId,
      }));
      setInviteUsername('');
    } catch (err) {
      console.error('Failed to send invite:', err);
      setInviteError('Failed to send invite');
    }
  };

  return (
    <header className="h-14 px-4 flex items-center justify-between bg-green-900 text-white shadow-md z-10">
      <div
        onClick={() => navigate('/games')}
        className="text-lg font-semibold cursor-pointer select-none hover:text-green-300"
      >
        TableTop Studio
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Invite username"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="text-sm px-2 py-1 rounded bg-green-700 border border-green-600 placeholder-green-300 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {inviteError && (
                  <div className="absolute top-full mt-1 left-0 right-0 text-xs text-red-300 bg-red-900/50 px-2 py-1 rounded">
                    {inviteError}
                  </div>
                )}
              </div>
              <button
                onClick={handleInvite}
                disabled={!isConnected}
                className={`px-2 py-1 rounded text-white transition-colors ${
                  isConnected 
                    ? 'bg-green-600 hover:bg-green-500' 
                    : 'bg-green-800 cursor-not-allowed'
                }`}
                title={isConnected ? 'Send Invite' : 'Not connected'}
              >
                <Send size={16} />
              </button>
            </div>

            <NotificationsMenu wsRef={wsRef} />

            <div className="relative" ref={usersRef}>
              <button
                onClick={() => setUsersOpen(!usersOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded bg-green-800 hover:bg-green-700"
                title="View Online Players"
              >
                <Users size={18} />
              </button>
              {usersOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-green-800 border border-green-700 rounded-md shadow-lg z-30 text-sm text-white max-h-64 overflow-y-auto">
                  <div className="px-4 py-2 font-semibold border-b border-green-600">
                    Online Players
                  </div>
                  {onlineUsers.length > 0 ? (
                    onlineUsers.map((username) => (
                      <div key={username} className="px-4 py-1.5 hover:bg-green-700">
                        {username}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-green-300">No one online yet</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-green-800 border border-transparent rounded-md transition"
            >
              <User size={18} />
              <span className="hidden sm:inline">{user.username}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-green-800 border border-green-700 rounded-md shadow-lg z-20 text-sm text-white">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-700"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={() => navigate('/editor')}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-700"
                >
                  <Plus size={16} /> Create Game
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-700"
                >
                  <Gamepad2 size={16} /> My Games
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-700 border-t border-green-600"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/login')}
              className="text-sm px-4 py-1.5 rounded-md border border-green-300 text-green-200 hover:bg-green-800"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm px-4 py-1.5 rounded-md bg-green-700 text-white hover:bg-green-600"
            >
              Sign Up
            </button>
            <button
              onClick={handleGuestLogin}
              className="text-sm px-4 py-1.5 rounded-md bg-green-800 text-white border border-green-700 hover:bg-green-700"
            >
              Continue as Guest
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default PlayTopbar;
