import React from 'react';
import { v4 as uuid } from 'uuid';

export type Condition = {
  id: string;
  type: 'card_count' | 'has_card' | 'effect_triggered' | 'custom';
  operator?: '==' | '>=' | '<=' | 'includes';
  value?: number | string;
  description?: string;
};

interface Props {
  title: string;
  conditions: Condition[];
  onChange: (updated: Condition[]) => void;
}

const ConditionsEditor: React.FC<Props> = ({ title, conditions, onChange }) => {
  const handleAdd = () => {
    onChange([
      ...conditions,
      { id: uuid(), type: 'card_count', operator: '>=', value: 1 },
    ]);
  };

  const handleUpdate = (id: string, changes: Partial<Condition>) => {
    onChange(conditions.map(c => (c.id === id ? { ...c, ...changes } : c)));
  };

  const handleRemove = (id: string) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      {conditions.map((cond) => (
        <div key={cond.id} className="flex items-center gap-2 text-sm">
          <select
            value={cond.type}
            onChange={(e) => handleUpdate(cond.id, { type: e.target.value as Condition['type'] })}
            className="border rounded px-2 py-1"
          >
            <option value="card_count">Card Count</option>
            <option value="has_card">Has Specific Card</option>
            <option value="effect_triggered">Effect Triggered</option>
            <option value="custom">Custom</option>
          </select>

          {cond.type === 'custom' ? (
            <input
              type="text"
              placeholder="Describe condition"
              value={cond.description || ''}
              onChange={(e) => handleUpdate(cond.id, { description: e.target.value })}
              className="border rounded px-2 py-1 w-64"
            />
          ) : (
            <>
              <select
                value={cond.operator}
                onChange={(e) => handleUpdate(cond.id, { operator: e.target.value as any })}
                className="border rounded px-2 py-1"
              >
                <option value="==">==</option>
                <option value=">=">{'>='}</option>
                <option value="<=">{'<='}</option>
                <option value="includes">includes</option>
              </select>
              <input
                type="text"
                value={cond.value?.toString() || ''}
                onChange={(e) => handleUpdate(cond.id, { value: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </>
          )}

          <button onClick={() => handleRemove(cond.id)} className="text-red-500 text-xs">
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
      >
        + Add Condition
      </button>
    </div>
  );
};

export default ConditionsEditor;
