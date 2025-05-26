import { Effect } from './Effect';

export interface GameElement {
  id: string;
  name: string;
  type: 'card' | 'token' | 'text';
  x: number;
  y: number;
  imageUrl?: string;
  width?: number;
  height?: number;
  effects?: Effect[];
}