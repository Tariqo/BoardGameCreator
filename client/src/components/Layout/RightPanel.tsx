import React from 'react';
import {
  SlidersHorizontal,
  Palette,
  Settings,
  Ruler,
  Text,
  X,
} from 'lucide-react';

interface RightPanelProps {
  onClose: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ onClose }) => {
  return (
    <div className="w-80 border-l bg-white shadow-sm p-4 space-y-6 overflow-auto relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-black"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-lg font-semibold flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5" /> Page Settings
      </h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Canvas Size</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Width" className="input" />
          <input type="number" placeholder="Height" className="input" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Colors
        </label>
        <div className="grid grid-cols-6 gap-2">
          {['#000', '#444', '#888', '#ccc', '#eee', '#fff'].map((c) => (
            <div
              key={c}
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Text className="w-4 h-4" />
          Default Text
        </label>
        <select className="input">
          <option>Sans</option>
          <option>Serif</option>
          <option>Mono</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Spacing
        </label>
        <input type="range" min={0} max={100} />
      </div>

      <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded font-medium flex items-center justify-center gap-2">
        <Settings className="w-5 h-5" />
        Reset All
      </button>
    </div>
  );
};

export default RightPanel;
