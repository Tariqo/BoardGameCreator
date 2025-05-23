import React, { useState } from 'react';
import { Effect, EffectType } from '../types/Effect';
import { v4 as uuid } from 'uuid';

interface EffectsEditorProps {
  effects: Effect[];
  onChange: (effects: Effect[]) => void;
}

const EffectsEditor: React.FC<EffectsEditorProps> = ({ effects, onChange }) => {
  const [newType, setNewType] = useState<EffectType>('draw');
  const [newAmount, setNewAmount] = useState(1);

  const handleAdd = () => {
    const newEffect: Effect = {
      id: uuid(),
      type: newType,
      amount: newAmount,
    };
    onChange([...effects, newEffect]);
  };

  const handleRemove = (id: string) => {
    onChange(effects.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Effects</h4>
      {effects.map((effect) => (
        <div key={effect.id} className="flex justify-between items-center text-sm">
          <span>{effect.type} {effect.amount}</span>
          <button
            onClick={() => handleRemove(effect.id)}
            className="text-red-500 text-xs hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as EffectType)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="draw">Draw Cards</option>
          <option value="roll">Roll Dice</option>
          <option value="play">Play Cards</option>
        </select>
        <input
          type="number"
          value={newAmount}
          min={1}
          onChange={(e) => setNewAmount(Number(e.target.value))}
          className="w-16 border px-2 py-1 rounded text-sm"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default EffectsEditor;