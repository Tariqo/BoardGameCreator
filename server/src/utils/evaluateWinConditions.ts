import { FlowStep } from '../types/Flow';
import { Condition } from '../types/Condition';
import { evaluateConditions, EvaluateContext } from './evaluateConditions';

export interface GameFlowContext extends EvaluateContext {
  deck: any[];
}

export function resolveNextStep(step: FlowStep, context: GameFlowContext): string | null {
  if (!step) return null;

  if (step.conditionalNext?.length) {
    for (const cond of step.conditionalNext) {
      if (checkCondition(cond.condition, context)) {
        return cond.nextStepId;
      }
    }
  }

  return step.next ?? null;
}

function checkCondition(condition: string, ctx: GameFlowContext): boolean {
  switch (condition) {
    case 'deck_empty':
      return ctx.deck.length === 0;

    case 'no_playable_cards':
      return !ctx.hand.some((card: any) =>
        !card.playConditions || evaluateConditions(card.playConditions, ctx)
      );

    case 'win_condition_met':
      return evaluateWinConditions(ctx.player?.winConditions || [], ctx);

    default:
      return false;
  }
}

// Inlined win condition logic
export function evaluateWinConditions(conditions: Condition[], context: EvaluateContext): boolean {
  for (const condition of conditions) {
    if (condition.type !== 'attribute') continue;

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
        if (condition.comparison === 'matches' && playerScore !== expected) return false;
        if (condition.comparison === 'does_not_match' && playerScore === expected) return false;
        break;
      }

      case 'last_player_standing': {
        const alive = context.totalPlayers - context.eliminatedPlayerIds.length;
        const isAlive = !context.eliminatedPlayerIds.includes(context.playerId);
        if (condition.comparison === 'matches' && (!isAlive || alive !== 1)) return false;
        if (condition.comparison === 'does_not_match' && (isAlive && alive === 1)) return false;
        break;
      }

      default:
        console.warn(`⚠️ Unknown attribute in win condition: ${condition.attribute}`);
        return false;
    }
  }

  return true;
}