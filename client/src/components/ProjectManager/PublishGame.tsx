import download from 'downloadjs';
import { RuleSet } from '../../components/GameEditor/RuleSetEditor';
import { FlowStep } from '../../components/GameEditor/FlowEditor';
import  { Card } from '../../types/Card';
import { BoardElement } from '../../types/BoardElement';
export type { BoardElement } from '../../types/BoardElement';

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
