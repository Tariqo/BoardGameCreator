import { FlowStep, FlowCondition } from '../types/Flow';
import { evaluateConditions } from './evaluateConditions';
import { evaluateWinConditions } from './evaluateWinConditions';
import { Condition } from '../types/Condition';

interface Context {
  deck: any[];
  hand: any[];
  player: any;
  playerId: string;
  totalPlayers: number;
  eliminatedPlayerIds: string[];
}

export function resolveNextStep(step: FlowStep, context: Context): string | null {
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

function checkCondition(condition: string, ctx: Context): boolean {
  switch (condition) {
    case 'deck_empty':
      return ctx.deck.length === 0;
    case 'no_playable_cards':
      return !ctx.hand.some((card: any) =>
        !card.playConditions || evaluateConditions(card.playConditions, {
          hand: ctx.hand,
          totalPlayers: ctx.totalPlayers,
          eliminatedPlayerIds: ctx.eliminatedPlayerIds,
          playerId: ctx.playerId,
          player: ctx.player,
        })
      );
    case 'win_condition_met':
      return evaluateWinConditions(ctx.player?.winConditions ?? [], {
        hand: ctx.hand,
        totalPlayers: ctx.totalPlayers,
        eliminatedPlayerIds: ctx.eliminatedPlayerIds,
        playerId: ctx.playerId,
        player: ctx.player,
      });
    default:
      return false;
  }
}
