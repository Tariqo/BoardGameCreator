export type ConditionType =
  | 'card_count'
  | 'score_equals'
  | 'last_player_standing'
  | 'custom';

export type Condition = {
  id: string;
  type: ConditionType;
  value?: number | string;
  description?: string;
};
export {};