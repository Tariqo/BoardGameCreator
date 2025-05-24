import download from 'downloadjs';
import { RuleSet } from '../../components/GameEditor/RuleSetEditor';
import { FlowStep } from '../../components/GameEditor/FlowEditor';
import { Card } from '../../components/GameEditor/DeckBuilder';

export interface BoardElement {
  id: string;
  name: string;
  type: 'card' | 'text' | 'token';
  x: number;
  y: number;
  imageUrl?: string;
  width?: number;
  height?: number;
}

interface PublishParams {
  ruleSet: RuleSet;
  elements: BoardElement[];
  gameFlow: FlowStep[];
  deck: Card[];
  discardPile: Card[];
  players: { name: string; hand: Card[] }[];
  maxPlayers: number;
  initialHandCount: number[];
  fileName?: string;
}

export const publishGame = ({
  ruleSet,
  elements,
  gameFlow,
  deck,
  discardPile,
  players,
  maxPlayers,
  initialHandCount,
  fileName = 'boardgame-published.json',
}: PublishParams) => {
  const data = {
    ruleSet,
    canvas: elements,
    gameFlow,
    deck,
    discardPile,
    players,
    maxPlayers,
    initialHandCount,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  download(blob, fileName, 'application/json');
};
