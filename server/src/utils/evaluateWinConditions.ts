import { Condition } from '../types/Condition';
import { EvaluateContext } from './evaluateConditions';

export function evaluateWinConditions(conditions: Condition[], context: EvaluateContext): boolean {
  for (const condition of conditions) {
    if (condition.type !== 'attribute') continue; // Skip card conditions

    switch (condition.attribute) {
      case 'card_count': {
        const count = context.hand.length;
        const expected = parseInt(condition.value, 10);
        if (condition.comparison === 'matches' && count !== expected) return false;
        if (condition.comparison === 'does_not_match' && count === expected) return false;
        if (condition.comparison === 'matches_one_or_more' && count < expected) return false;
        break;
      }

      case 'score_equals': {
        const playerScore = context.player?.score ?? 0;
        const expected = parseInt(condition.value, 10);
        if (playerScore !== expected) return false;
        break;
      }

      case 'last_player_standing': {
        const alive = context.totalPlayers - context.eliminatedPlayerIds.length;
        if (alive !== 1 || context.eliminatedPlayerIds.includes(context.playerId)) return false;
        break;
      }

      default:
        return false;
    }
  }

  return true;
}
