import { CONTRADICTION_RULES } from './relationshipRules.js';

function getParamKey(item) {
  return item?.id ?? item?.parameter ?? null;
}

/**
 * Detects physiological and cross-parameter contradictions based on configurable rules.
 */
export function detectContradictions(parameters = [], rules = CONTRADICTION_RULES) {
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

  const contradictions = [];

  for (const rule of rules) {
    const conflictingParams = [];
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

      conflictingParams.push(cond.parameter);
    }

    if (allConditionsMet) {
      contradictions.push({
        id: rule.id,
        category: rule.category,
        description: rule.description,
        severity: rule.severity || 'MODERATE',
        conflictingParameters: conflictingParams,
      });
    }
  }

  return contradictions;
}

export default detectContradictions;
