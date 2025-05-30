export interface Game {
  _id: string;
  name: string;
  createdAt: string;
  tags?: string[];
  maxPlayers?: number;
  description?: string;
  canvas?: any[];
  gameFlow?: any[];
  deck?: any[];
  discardPile?: any[];
  players?: any[];
  initialHandCount?: number[];
  shuffleOnStart?: boolean;
  ruleSet?: {
    id: string;
    name: string;
    gameplayMode: string;
    maxPlayers: number;
    teamCount: number;
    playersPerTeam: number;
    winConditions: any[];
    eliminationConditions: any[];
    actions: any[];
    tags: string[];
    turnEffects: any[];
    initialHand: any[];
    initialHandCount: number;
  };
}