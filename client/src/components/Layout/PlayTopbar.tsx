import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Gamepad2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PlayTopbar: React.FC = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGuestLogin = () => {
    login('guest', { username: 'Guest' });
    navigate('/games');
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
