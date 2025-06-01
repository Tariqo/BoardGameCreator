import ConditionsEditor, { Condition } from '../components/GameEditor/ConditionsEditor';

export type Card = {
  id: string;
  name: string;
  imageUrl?: string;
  publicId?: string;
  tags?: string[];
  playConditions?: Condition[];
  effects?: any[];
  x?: number;
  y?: number;
};