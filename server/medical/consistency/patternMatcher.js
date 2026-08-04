import { PATTERN_RULES } from './relationshipRules.js';

function getParamKey(item) {
  return item?.id ?? item?.parameter ?? null;
}

/**
 * Matches configurable biomarker pattern rules against a map or list of evaluated parameters.
 */
export function matchPatterns(parameters = [], rules = PATTERN_RULES) {
  if (!Array.isArray(parameters) || parameters.length === 0) {
    return [];
  }

  const paramMap = new Map();
  for (const item of parameters) {
    const key = getParamKey(item);
    if (key) {
      paramMap.set(key, item);
    }
  }

  const matched = [];

  for (const rule of rules) {
    const matchedParams = [];
    let allConditionsMet = true;

    for (const cond of rule.conditions) {
      const param = paramMap.get(cond.parameter);
      if (!param) {
        allConditionsMet = false;
        break;
      }

      const status = param.status ?? 'UNKNOWN';
      const severity = param.severity ?? '';

      const statusMatch = Array.isArray(cond.statusIn) ? cond.statusIn.includes(status) || cond.statusIn.includes(severity) : true;

      if (!statusMatch) {
        allConditionsMet = false;
        break;
      }

      matchedParams.push(cond.parameter);
    }

    if (allConditionsMet) {
      matched.push({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        description: rule.description,
        confidence: 0.95,
        matchedParameters: matchedParams,
      });
    }
  }

  return matched;
}

export default matchPatterns;
