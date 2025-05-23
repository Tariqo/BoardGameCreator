import React, { useState } from 'react';
import EffectsEditor from './EffectsEditor';
import { Effect } from '../types/Effect';

export type RuleSet = {
  id: string;
  name: string;
  gameplayMode: 'cards' | 'dice';
  maxPlayers: number;
  teamCount: number;
  playersPerTeam: number;
  winCondition: string;
  eliminationCondition: string;
  actions: string[];
  tags: string[];
  turnEffects: Effect[];
  initialHand: string[];
  initialHandCount?: number;
};

interface RuleSetEditorProps {
  gameplayMode: 'cards' | 'dice';
  maxPlayers: number;
  onSave: (ruleSet: RuleSet) => void;
}

const RuleSetEditor: React.FC<RuleSetEditorProps> = ({
  gameplayMode,
  maxPlayers,
  onSave,
}) => {
  const [ruleSetName, setRuleSetName] = useState('');
  const [winCondition, setWinCondition] = useState('');
  const [eliminationCondition, setEliminationCondition] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [turnEffects, setTurnEffects] = useState<Effect[]>([]);
  const [initialHand, setInitialHand] = useState<string[]>([]);
  const [handInput, setHandInput] = useState('');
  const [initialHandCount, setInitialHandCount] = useState<number>(0);

  const handleSave = () => {
    const ruleSet: RuleSet = {
      id: crypto.randomUUID(),
      name: ruleSetName,
      gameplayMode,
      maxPlayers,
      teamCount,
      playersPerTeam,
      winCondition,
      eliminationCondition,
      actions: [],
      tags,
      turnEffects,
      initialHand,
      initialHandCount,
    };
    onSave(ruleSet);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput('');
    }
  };

  const handleAddHandCard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && handInput.trim()) {
      e.preventDefault();
      setInitialHand((prev) => [...prev, handInput.trim()]);
      setHandInput('');
    }
  };

  return (
    <div className="border-t pt-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Rule Set</h3>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Rule Set Name</label>
        <input
          type="text"
          value={ruleSetName}
          onChange={(e) => setRuleSetName(e.target.value)}
          className="w-full border px-2 py-1 text-sm rounded"
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Win Condition</label>
        <input
          type="text"
          value={winCondition}
          onChange={(e) => setWinCondition(e.target.value)}
          className="w-full border px-2 py-1 text-sm rounded"
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Elimination Condition</label>
        <input
          type="text"
          value={eliminationCondition}
          onChange={(e) => setEliminationCondition(e.target.value)}
          className="w-full border px-2 py-1 text-sm rounded"
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Number of Teams</label>
        <input
          type="number"
          value={teamCount}
          onChange={(e) => setTeamCount(Number(e.target.value))}
          className="w-full border px-2 py-1 text-sm rounded"
          min={1}
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Players Per Team</label>
        <input
          type="number"
          value={playersPerTeam}
          onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
          className="w-full border px-2 py-1 text-sm rounded"
          min={1}
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Tags (press Enter to add)</label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full border px-2 py-1 text-sm rounded"
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Player Turn Effects</label>
        <EffectsEditor effects={turnEffects} onChange={setTurnEffects} />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Initial Hand (Enter to add)</label>
        <input
          type="text"
          value={handInput}
          onChange={(e) => setHandInput(e.target.value)}
          onKeyDown={handleAddHandCard}
          className="w-full border px-2 py-1 text-sm rounded"
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {initialHand.map((card, i) => (
            <span
              key={i}
              className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full"
            >
              {card}
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Initial Hand Card Count (Optional)</label>
        <input
          type="number"
          value={initialHandCount}
          onChange={(e) => setInitialHandCount(Number(e.target.value))}
          min={0}
          className="w-full border px-2 py-1 text-sm rounded"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
      >
        Save Rule Set
      </button>
    </div>
  );
};

export default RuleSetEditor;
