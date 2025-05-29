export type CardConditionType = 'tag' | 'name';
export type AttributeConditionType = 'card_count' | 'score_equals' | 'last_player_standing' | 'tag' | 'name';
export type ComparisonType =
  | 'matches'
  | 'does_not_match'
  | 'matches_one_or_more'
  | 'equals'
  | 'greater_than'
  | 'less_than';


export type Condition =
  | {
      id: string;
      type: 'card';
      conditionType: CardConditionType;
      comparison: ComparisonType;
      value: string;
    }
  | {
      id: string;
      type: 'attribute';
      attribute: AttributeConditionType;
      comparison: ComparisonType;
      value: string;
    };

export {};