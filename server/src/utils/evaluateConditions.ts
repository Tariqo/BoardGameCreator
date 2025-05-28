// utils/evaluateConditions.ts
import { Condition } from '../types/Condition';
import { Card } from '../types/Card';

export function evaluateConditions(
  conditions: Condition[],
  context: {
    hand: Card[];
    totalPlayers: number;
    eliminatedPlayerIds: string[];
    playerId: string;
  }
): boolean {
  return conditions.every(cond => {
    switch (cond.type) {
      case 'card_count':
        return context.hand.length === Number(cond.value);
      case 'score_equals':
        return false;
      case 'last_player_standing':
        return context.totalPlayers - context.eliminatedPlayerIds.length === 1 &&
               !context.eliminatedPlayerIds.includes(context.playerId);
      case 'custom':
        return false;
      default:
        return false;
    }
  });
}
