import React, { useState } from 'react';
import ConditionsEditor, { Condition } from './ConditionsEditor';

export type RuleSet = {
  id: string;
  name: string;
  description?: string;
  gameplayMode: 'cards' | 'dice';
  maxPlayers: number;
  teamCount: number;
  playersPerTeam: number;
  winConditions: Condition[];
  eliminationConditions: Condition[];
  actions: string[];
  tags: string[];
  turnEffects: any[];
  initialHand: string[];
  initialHandCount?: number;
};

interface RuleSetEditorProps {
  gameplayMode: 'cards' | 'dice';
  maxPlayers: number;
  useTeams: boolean;
  tags: string[];
  onSave: (ruleSet: RuleSet) => void;
}

const RuleSetEditor: React.FC<RuleSetEditorProps> = ({
  gameplayMode,
  maxPlayers,
  useTeams: initialUseTeams,
  tags,
  onSave,
}) => {
  const [ruleSetName, setRuleSetName] = useState('');
  const [description, setDescription] = useState('');
  const [winConditions, setWinConditions] = useState<Condition[]>([]);
  const [eliminationConditions, setEliminationConditions] = useState<Condition[]>([]);
  const [teamCount, setTeamCount] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(1);
  const [initialHandCount, setInitialHandCount] = useState<number>(0);
  const [useTeams, setUseTeams] = useState(initialUseTeams);

  const handleSave = () => {
    const ruleSet: RuleSet = {
      id: crypto.randomUUID(),
      name: ruleSetName,
      description,
      gameplayMode,
      maxPlayers,
      teamCount: useTeams ? teamCount : 0,
      playersPerTeam: useTeams ? playersPerTeam : 0,
      winConditions,
      eliminationConditions,
      actions: [],
      tags,
      turnEffects: [],
      initialHand: [],
      initialHandCount,
    };
    onSave(ruleSet);
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
        <label className="text-xs text-gray-600 block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-2 py-1 text-sm rounded"
          rows={3}
        />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Win Conditions</h4>
        <ConditionsEditor
          winConditions={winConditions}
          onWinConditionsChange={setWinConditions}
        />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Elimination Conditions</h4>
        <ConditionsEditor
          winConditions={eliminationConditions}
          onWinConditionsChange={setEliminationConditions}
        />
      </div>

      <div>
        <button
          onClick={() => setUseTeams(!useTeams)}
          className={`w-full px-3 py-2 rounded text-sm font-medium ${
            useTeams ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {useTeams ? 'Disable Teams' : 'Enable Teams'}
        </button>
      </div>

      {useTeams && (
        <>
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
        </>
      )}

      <div>
        <label className="text-xs text-gray-600 block mb-1">Initial Hand Card Count</label>
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
