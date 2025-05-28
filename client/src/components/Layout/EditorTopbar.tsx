import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  Palette,
  Settings,
  Ruler,
  Text,
  User,
  LogOut,
  Gamepad2,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface EditorTopbarProps {
  isRightPanelVisible: boolean;
  onToggleRightPanel: () => void;
  onToggleGrid: () => void;
  onSaveGame: () => void;
  onToggleDeckBuilder: () => void; // ✅ Add this line
  onToggleFlowEditor: () => void;
}

const EditorTopbar: React.FC<EditorTopbarProps> = ({
  isRightPanelVisible,
  onToggleRightPanel,
  onToggleGrid,
  onSaveGame,
  onToggleDeckBuilder, // ✅ Include this here too
  onToggleFlowEditor,
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 px-4 border-b border-gray-300 flex items-center justify-between bg-gray-100">
      {/* Left toolbar group */}
      <div className="flex gap-4 items-center">
        <ToolbarButton icon={<Ruler size={18} />} label="Grid" onClick={onToggleGrid} />
        <ToolbarButton icon={<Gamepad2 size={18} />} label="Deck Builder" onClick={onToggleDeckBuilder} />
        <ToolbarButton icon={<SlidersHorizontal size={18} />} label="Flow Editor" onClick={onToggleFlowEditor} />
        <ToolbarButton icon={<Palette size={18} />} label="Style" />
        <ToolbarButton icon={<Text size={18} />} label="Text" />
        <ToolbarButton icon={<SlidersHorizontal size={18} />} label="Adjust" />
        <ToolbarButton icon={<Save size={18} />} label="Save Game" onClick={onSaveGame} />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleRightPanel}
          className="flex items-center gap-2 text-sm text-gray-700 border px-3 py-1.5 rounded hover:bg-white shadow-sm"
        >
          <Settings size={16} />
          {isRightPanelVisible ? 'Hide Settings' : 'Show Settings'}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-white border border-transparent rounded-md hover:border-gray-300 transition"
          >
            <User size={18} />
            <span className="hidden sm:inline">{user?.username}</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-md z-10 text-sm text-gray-700">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <User size={16} /> Profile
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
      </div>
    </header>
  );
};

const ToolbarButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({
  icon,
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-white border border-transparent rounded-md hover:border-gray-300 transition"
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default EditorTopbar;
