import React from 'react';
import { v4 as uuid } from 'uuid';

export type CardConditionType = 'tag' | 'name';
export type AttributeConditionType = 'card_count' | 'score_equals' | 'last_player_standing';
export type ComparisonType = 'matches' | 'does_not_match' | 'matches_one_or_more';

export type Condition =
  | {
      id: string;
      type: 'card';
      conditionType: CardConditionType;
      comparison: ComparisonType;
      value: string;
    }
  | {
      id: string;
      type: 'attribute';
      attribute: AttributeConditionType;
      comparison: ComparisonType;
      value: string;
    };

interface Props {
  cardConditions?: Condition[];
  onCardConditionsChange?: (updated: Condition[]) => void;
  winConditions?: Condition[];
  onWinConditionsChange?: (updated: Condition[]) => void;
}

const ConditionsEditor: React.FC<Props> = ({
  cardConditions = [],
  winConditions = [],
  onCardConditionsChange,
  onWinConditionsChange,
}) => {
  const handleAdd = (type: 'card' | 'attribute', isWin: boolean) => {
    const newCondition: Condition =
      type === 'card'
        ? {
            id: uuid(),
            type: 'card',
            conditionType: 'tag',
            comparison: 'matches',
            value: '',
          }
        : {
            id: uuid(),
            type: 'attribute',
            attribute: 'card_count',
            comparison: 'matches',
            value: '1',
          };

    const updater = isWin ? onWinConditionsChange : onCardConditionsChange;
    const current = isWin ? winConditions : cardConditions;
    if (updater) updater([...current, newCondition]);
  };

  const handleUpdate = (id: string, changes: Partial<Condition>, isWin: boolean) => {
    const updater = isWin ? onWinConditionsChange : onCardConditionsChange;
    const current = isWin ? winConditions : cardConditions;

    if (updater && current) {
      updater(
        current.map((c) => {
          if (c.id !== id) return c;

          if (c.type === 'card' && changes.type !== 'attribute') {
            return { ...c, ...(changes as Partial<typeof c>) };
          }

          if (c.type === 'attribute' && changes.type !== 'card') {
            return { ...c, ...(changes as Partial<typeof c>) };
          }

          return c;
        })
      );
    }
  };

  const handleRemove = (id: string, isWin: boolean) => {
    const updater = isWin ? onWinConditionsChange : onCardConditionsChange;
    const current = isWin ? winConditions : cardConditions;
    if (updater && current) updater(current.filter((c) => c.id !== id));
  };

  const renderCondition = (cond: Condition, isWin: boolean) => (
    <div
      key={cond.id}
      className="flex flex-wrap items-center gap-2 text-sm border p-2 rounded bg-gray-50"
    >
      {cond.type === 'card' ? (
        <>
          <select
            value={cond.conditionType}
            onChange={(e) =>
              handleUpdate(
                cond.id,
                { conditionType: e.target.value as CardConditionType, value: '' },
                isWin
              )
            }
            className="border rounded px-2 py-1"
          >
            <option value="tag">Tag</option>
            <option value="name">Name</option>
          </select>

          <select
            value={cond.comparison}
            onChange={(e) =>
              handleUpdate(
                cond.id,
                { comparison: e.target.value as ComparisonType },
                isWin
              )
            }
            className="border rounded px-2 py-1"
          >
            <option value="matches">Matches</option>
            <option value="does_not_match">Doesn’t Match</option>
            <option value="matches_one_or_more">Matches One or More</option>
          </select>

          <input
            type="text"
            placeholder="Value"
            value={cond.value}
            onChange={(e) => handleUpdate(cond.id, { value: e.target.value }, isWin)}
            className="border rounded px-2 py-1"
          />
        </>
      ) : (
        <>
          <select
            value={cond.attribute}
            onChange={(e) =>
              handleUpdate(
                cond.id,
                { attribute: e.target.value as AttributeConditionType, value: '' },
                isWin
              )
            }
            className="border rounded px-2 py-1"
          >
            <option value="card_count">Has X Cards</option>
            <option value="score_equals">Score Equals</option>
            <option value="last_player_standing">Last Player Standing</option>
          </select>

          <select
            value={cond.comparison}
            onChange={(e) =>
              handleUpdate(
                cond.id,
                { comparison: e.target.value as ComparisonType },
                isWin
              )
            }
            className="border rounded px-2 py-1"
          >
            <option value="matches">Matches</option>
            <option value="does_not_match">Doesn’t Match</option>
            <option value="matches_one_or_more">Matches One or More</option>
          </select>

          <input
            type="text"
            placeholder="Value"
            value={cond.value}
            onChange={(e) => handleUpdate(cond.id, { value: e.target.value }, isWin)}
            className="border rounded px-2 py-1"
          />
        </>
      )}

      <button
        onClick={() => handleRemove(cond.id, isWin)}
        className="text-red-500 text-xs ml-auto"
      >
        ✕
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {onCardConditionsChange && (
        <div>
          <h3 className="text-md font-semibold mb-2">Card Play Conditions</h3>
          {cardConditions.map((cond) => renderCondition(cond, false))}
          <button
            onClick={() => handleAdd('card', false)}
            className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            + Add Card Condition
          </button>
        </div>
      )}

      {onWinConditionsChange && (
        <div>
          <h3 className="text-md font-semibold mb-2">Win / Elimination Conditions</h3>
          {winConditions.map((cond) => renderCondition(cond, true))}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleAdd('attribute', true)}
              className="bg-indigo-500 text-white text-xs px-2 py-1 rounded"
            >
              + Add Condition
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionsEditor;
