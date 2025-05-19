import React from 'react';
import {
  SlidersHorizontal,
  Palette,
  Settings,
  Ruler,
  Text,
} from 'lucide-react';

const EditorTopbar: React.FC = () => {
  return (
    <header className="h-14 px-4 border-b border-gray-300 flex items-center gap-4 bg-gray-100">
      {/* Toolbar buttons */}
      <ToolbarButton icon={<Ruler size={18} />} label="Grid" />
      <ToolbarButton icon={<Palette size={18} />} label="Style" />
      <ToolbarButton icon={<Text size={18} />} label="Text" />
      <ToolbarButton icon={<SlidersHorizontal size={18} />} label="Adjust" />
      <ToolbarButton icon={<Settings size={18} />} label="Settings" />
    </header>
  );
};

const ToolbarButton: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => {
  return (
    <button
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-white border border-transparent rounded-md hover:border-gray-300 transition"
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default EditorTopbar;
