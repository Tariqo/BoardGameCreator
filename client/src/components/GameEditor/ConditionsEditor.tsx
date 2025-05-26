import React from 'react';
import { v4 as uuid } from 'uuid';

export type Condition = {
  id: string;
  attribute: 'tag' | 'name' | 'custom';
  comparison: 'matches' | 'does_not_match' | 'matches_one_or_more';
  value: string | number;
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
      {
        id: uuid(),
        attribute: 'tag',
        comparison: 'matches',
        value: '',
      },
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
        <div
          key={cond.id}
          className="flex flex-wrap items-center gap-2 text-sm border p-2 rounded bg-gray-50"
        >
          <select
            value={cond.attribute}
            onChange={(e) =>
              handleUpdate(cond.id, {
                attribute: e.target.value as Condition['attribute'],
                value: '',
              })
            }
            className="border rounded px-2 py-1"
          >
            <option value="tag">Tag</option>
            <option value="name">Name</option>
            <option value="custom">Custom</option>
          </select>

          <select
            value={cond.comparison}
            onChange={(e) =>
              handleUpdate(cond.id, {
                comparison: e.target.value as Condition['comparison'],
              })
            }
            className="border rounded px-2 py-1"
          >
            <option value="matches">Matches</option>
            <option value="does_not_match">Doesn’t Match</option>
            <option value="matches_one_or_more">Matches One or More</option>
          </select>

          {cond.attribute === 'custom' ? (
            <input
              type="text"
              placeholder="Describe condition"
              value={cond.description || ''}
              onChange={(e) => handleUpdate(cond.id, { description: e.target.value })}
              className="border rounded px-2 py-1 w-64"
            />
          ) : (
            <input
              type="text"
              placeholder="Value"
              value={cond.value?.toString() || ''}
              onChange={(e) => handleUpdate(cond.id, { value: e.target.value })}
              className="border rounded px-2 py-1"
            />
          )}

          <button
            onClick={() => handleRemove(cond.id)}
            className="text-red-500 text-xs ml-auto"
          >
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
