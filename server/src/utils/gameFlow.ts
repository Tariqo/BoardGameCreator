import { FlowStep } from '../types/Flow';
import { evaluateConditions } from './evaluateConditions';

export function getNextStep(
  game: any,
  currentStep: FlowStep,
  playerIndex: number
): string | null {
  const hand = game.players[playerIndex].hand;
  const player = game.players[playerIndex];

  for (const cond of currentStep.conditionalNext || []) {
    switch (cond.condition) {
      case 'deck_empty':
        if (game.deck.length === 0) return cond.nextStepId;
        break;

      case 'no_playable_cards': {
        const hasPlayable = hand.some((card: any) =>
          !card.playConditions || evaluateConditions(card.playConditions, {
            hand,
            totalPlayers: game.players.length,
            eliminatedPlayerIds: [],
            playerId: playerIndex.toString(),
            player, // ✅ added player
          })
        );
        if (!hasPlayable) return cond.nextStepId;
        break;
      }

      case 'win_condition_met':
        // TODO: Add evaluateWinConditions logic here
        break;
    }
  }

  return currentStep.next || null;
}
