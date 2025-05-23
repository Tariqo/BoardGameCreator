export type EffectType = 'draw' | 'roll' | 'play';

export interface Effect {
  id: string;
  type: EffectType;
  amount: number;
  description?: string;
}