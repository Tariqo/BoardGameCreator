import React, { useState } from 'react';
import { Effect, EffectType } from '../../types/Effect';
import { v4 as uuid } from 'uuid';

interface EffectsEditorProps {
  effects: Effect[];
  onChange: (effects: Effect[]) => void;
}

const EffectsEditor: React.FC<EffectsEditorProps> = ({ effects, onChange }) => {
  const [newType, setNewType] = useState<EffectType>('draw');
  const [newAmount, setNewAmount] = useState(1);
  const [target, setTarget] = useState<'self' | 'next' | 'previous' | 'all'>('next');

  const handleAdd = () => {
    const newEffect: Effect = {
      id: uuid(),
      type: newType,
      amount: ['draw', 'roll', 'play'].includes(newType) ? newAmount : undefined,
      target: ['skip_next', 'skip_previous', 'draw', 'play'].includes(newType) ? target : undefined,
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
          <span>
            {effect.type}
            {effect.amount ? ` ${effect.amount}` : ''} 
            {effect.target ? ` → ${effect.target}` : ''}
          </span>
          <button
            onClick={() => handleRemove(effect.id)}
            className="text-red-500 text-xs hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex gap-2 flex-wrap items-center">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as EffectType)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="draw">Draw Cards</option>
          <option value="roll">Roll Dice</option>
          <option value="play">Play Cards</option>
          <option value="skip_next">Skip Next Player</option>
          <option value="skip_previous">Skip Previous Player</option>
          <option value="reverse_order">Reverse Turn Order</option>
          <option value="custom">Custom</option>
        </select>

        {['draw', 'roll', 'play'].includes(newType) && (
          <input
            type="number"
            min={1}
            value={newAmount}
            onChange={(e) => setNewAmount(Number(e.target.value))}
            className="w-16 border px-2 py-1 rounded text-sm"
          />
        )}

        {['draw', 'play', 'skip_next', 'skip_previous'].includes(newType) && (
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as 'self' | 'next' | 'previous' | 'all')}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="self">Self</option>
            <option value="next">Next</option>
            <option value="previous">Previous</option>
            <option value="all">All</option>
          </select>
        )}

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
