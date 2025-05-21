import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Gamepad2, Plus, Search, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GamesTopbar: React.FC = () => {
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
    login('guest_token', 'user', 'Guest');
    navigate('/editor');
  };

  return (
    <header className="h-14 px-4 border-b border-gray-300 flex items-center justify-between bg-white shadow-sm z-10">
      {/* Left Logo / Title */}
      <div
        onClick={() => navigate('/')}
        className="text-lg font-semibold text-green-600 cursor-pointer select-none"
      >
        TableTop Studio
      </div>

      {/* Search + Profile */}
      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden sm:block">
          <input
            type="text"
            placeholder="Search games..."
            className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
        </div>

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 border border-transparent rounded-md hover:border-gray-300 transition"
            >
              <User size={18} />
              <span className="hidden sm:inline">{user}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-md z-20 text-sm text-gray-700">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={() => navigate('/editor')}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                >
                  <Plus size={16} /> Create Game
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                >
                  <Gamepad2 size={16} /> My Games
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 border-t"
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
              className="text-sm px-4 py-1.5 rounded-md border border-green-600 text-green-600 hover:bg-green-50"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm px-4 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Sign Up
            </button>
            <button
              onClick={handleGuestLogin}
              className="text-sm px-4 py-1.5 rounded-md bg-gray-100 text-gray-700 border hover:bg-gray-200"
            >
              Continue as Guest
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default GamesTopbar;
