import { Condition } from '../types/Condition';
import { Card } from '../types/Card';

export interface EvaluateContext {
  hand: Card[];
  totalPlayers: number;
  eliminatedPlayerIds: string[];
  playerId: string;
  player: any;
  lastPlayedTags?: string[];
  lastPlayedNames?: string[];
  card?: Card; // ✅ Add this
}

export function evaluateConditions(
  conditions: Condition[],
  context: EvaluateContext
): boolean {
  console.log('🧠 Evaluating conditions:', conditions);
  console.log('📦 Evaluation context:', context);

  return conditions.every(cond => {
    console.log('🔍 Checking condition:', cond);

    // ⛑ Infer type if missing
    const inferredType = cond.type || ('attribute' in cond ? 'attribute' : 'card');
    const normalizedCond = { ...cond, type: inferredType };

    switch (normalizedCond.type) {
      case 'attribute':
        return evaluateAttributeCondition(normalizedCond, context);
      case 'card':
        return evaluateCardCondition(normalizedCond, context);
      default:
        console.warn('⚠️ Unknown condition type:', normalizedCond);
        return false;
    }
  });
}

function evaluateAttributeCondition(cond: any, context: EvaluateContext): boolean {
  switch (cond.attribute) {
    case 'card_count':
      return compare(context.hand.length, Number(cond.value), cond.comparison);
    case 'score_equals':
      return compare(context.player?.score ?? 0, Number(cond.value), cond.comparison);
    case 'last_player_standing': {
      const alive = context.totalPlayers - context.eliminatedPlayerIds.length;
      const isAlive = !context.eliminatedPlayerIds.includes(context.playerId);
      return compare(alive, 1, cond.comparison) && isAlive;
    }
    case 'tag': {
      if (!context.lastPlayedTags || context.lastPlayedTags.length === 0) return true; // ✅ Allow first move
      const currentTags = context.card?.tags || [];
      const result = currentTags.some(tag => context.lastPlayedTags!.includes(tag));
      console.log(`🔄 Attribute 'tag': current card tags: ${currentTags}, last: ${context.lastPlayedTags}, result: ${result}`);
      return result;
    }
    case 'name': {
      if (!context.lastPlayedNames || context.lastPlayedNames.length === 0) return true;
      const currentName = context.card?.name || '';
      const result = context.lastPlayedNames.includes(currentName);
      console.log(`🔄 Attribute 'name': current card name: ${currentName}, last: ${context.lastPlayedNames}, result: ${result}`);
      return result;
    }
    default:
      console.warn(`⚠️ Unknown attribute: ${cond.attribute}`);
      return false;
  }
}


function evaluateCardCondition(cond: any, context: EvaluateContext): boolean {
  if (cond.conditionType === 'tag') {
    const currentCardTags = context.card?.tags || [];
    const lastTags = context.lastPlayedTags || [];
    const result = currentCardTags.some(tag => lastTags.includes(tag));
    console.log(`🔄 Comparing current card tags to last played tags → current: ${currentCardTags}, last: ${lastTags}, result: ${result}`);
    return result;
  }

  if (cond.conditionType === 'name') {
    const currentCardName = context.card?.name || '';
    const lastNames = context.lastPlayedNames || [];
    const result = lastNames.includes(currentCardName);
    console.log(`🔄 Comparing current card name to last played names → current: ${currentCardName}, last: ${lastNames}, result: ${result}`);
    return result;
  }

  console.warn(`⚠️ Unknown card condition type: ${cond.conditionType}`);
  return false;
}


function compare(actual: number, expected: number, comparison: string): boolean {
  switch (comparison) {
    case 'matches':
    case 'equals': return actual === expected;
    case 'does_not_match': return actual !== expected;
    case 'greater_than': return actual > expected;
    case 'less_than': return actual < expected;
    case 'matches_one_or_more': return actual >= expected;
    default:
      console.warn(`⚠️ Unknown numeric comparison: ${comparison}`);
      return false;
  }
}

function compareStringArray(array: string[], value: string, comparison: string): boolean {
  switch (comparison) {
    case 'matches':
    case 'equals': return array.length === 1 && array[0] === value;
    case 'does_not_match': return !array.includes(value);
    case 'matches_one_or_more': return array.includes(value);
    default:
      console.warn(`⚠️ Unknown string comparison: ${comparison}`);
      return false;
  }
}
