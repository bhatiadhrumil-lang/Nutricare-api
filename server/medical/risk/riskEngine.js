import { DOMAIN_BIOMARKER_MAP } from './riskRules.js';
import { calculateDomainScore } from './domainScoring.js';
import { calculateOverallScore } from './overallScoring.js';
import { RISK_WARNING_CODES, riskWarning } from './riskValidator.js';
import { CANONICAL_UNITS } from '../normalization/canonicalUnits.js';

function getParamKey(item) {
  return item?.id ?? item?.parameter ?? null;
}

/**
 * Main Medical Risk Scoring Engine.
 * Calculates domain scores, risk levels, confidence, and overall weighted health score.
 */
export function calculateHealthRisk(parameters = [], options = {}) {
  const warnings = [];

  if (!Array.isArray(parameters) || parameters.length === 0) {
    warnings.push(riskWarning(RISK_WARNING_CODES.MISSING_INPUT, 'No parameters provided for risk scoring.'));
  }

  // Validate unknown parameters
  if (Array.isArray(parameters)) {
    for (const item of parameters) {
      const key = getParamKey(item);
      if (key && !CANONICAL_UNITS[key]) {
        warnings.push(riskWarning(RISK_WARNING_CODES.UNKNOWN_PARAMETER, `Unknown parameter ID: ${key}.`));
      }
    }
  }

  const domainNames = Object.keys(DOMAIN_BIOMARKER_MAP);
  const activeDomains = [];

  for (const dName of domainNames) {
    const res = calculateDomainScore(dName, parameters);
    if (res?.domain && res.domain.score !== null) {
      activeDomains.push(res.domain);
    } else if (res?.warning) {
      warnings.push(res.warning);
    }
  }

  const overall = calculateOverallScore(activeDomains);

  return {
    healthScore: {
      overall,
      domains: activeDomains,
    },
    warnings,
  };
}

export default calculateHealthRisk;
