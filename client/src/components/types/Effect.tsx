export type EffectType =
  | 'draw'
  | 'roll'
  | 'play'
  | 'skip_next'
  | 'skip_previous'
  | 'reverse_order'
  | 'custom';

export interface Effect {
  id: string;
  type: EffectType;
  amount?: number;
  target?: 'self' | 'next' | 'previous' | 'all';
  description?: string;
}