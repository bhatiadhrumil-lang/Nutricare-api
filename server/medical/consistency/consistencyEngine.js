import { matchPatterns } from './patternMatcher.js';
import { detectContradictions } from './contradictionDetector.js';
import { CONSISTENCY_WARNING_CODES, consistencyWarning } from './consistencyValidator.js';
import { CANONICAL_UNITS } from '../normalization/canonicalUnits.js';

function getParamKey(item) {
  return item?.id ?? item?.parameter ?? null;
}

/**
 * Evaluates clinical relationships across laboratory biomarkers to identify
 * consistent patterns and cross-parameter contradictions without diagnosing disease.
 */
export function evaluateConsistency(inputParameters = []) {
  const warnings = [];

  if (!Array.isArray(inputParameters) || inputParameters.length === 0) {
    warnings.push(consistencyWarning(CONSISTENCY_WARNING_CODES.MISSING_PARAMETERS, 'No parameter list was provided for consistency evaluation.'));
    return {
      consistency: {
        score: 100,
        patterns: [],
        contradictions: [],
        warnings,
      },
    };
  }

  const validParams = [];

  for (const item of inputParameters) {
    if (!item || typeof item !== 'object') {
      warnings.push(consistencyWarning(CONSISTENCY_WARNING_CODES.INVALID_PARAMETER_FORMAT, 'Invalid parameter format detected.'));
      continue;
    }

    const key = getParamKey(item);
    if (!key || typeof key !== 'string') {
      warnings.push(consistencyWarning(CONSISTENCY_WARNING_CODES.UNKNOWN_PARAMETER, 'Parameter entry missing a valid identifier.'));
      continue;
    }

    if (!CANONICAL_UNITS[key]) {
      warnings.push(consistencyWarning(CONSISTENCY_WARNING_CODES.UNKNOWN_PARAMETER, `Unknown parameter ID: ${key}.`));
    }

    validParams.push(item);
  }

  const patterns = matchPatterns(validParams);
  const contradictions = detectContradictions(validParams);

  // Score calculation: start at 100, deduct for contradictions and warnings
  let score = 100;
  for (const contra of contradictions) {
    const penalty = contra.severity === 'HIGH' ? 25 : 15;
    score -= penalty;
  }

  for (const warn of warnings) {
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    consistency: {
      score,
      patterns,
      contradictions,
      warnings,
    },
  };
}

export default evaluateConsistency;
