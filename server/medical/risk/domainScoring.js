import { DOMAIN_BIOMARKER_MAP, SEVERITY_PENALTIES, classifyRiskLevel } from './riskRules.js';
import { RISK_WARNING_CODES, riskWarning } from './riskValidator.js';

function getParamKey(item) {
  return item?.id ?? item?.parameter ?? null;
}

/**
 * Calculates score, risk level, and confidence for a specific medical domain.
 */
export function calculateDomainScore(domainName, parameters = []) {
  const expectedBiomarkers = DOMAIN_BIOMARKER_MAP[domainName] || [];
  if (expectedBiomarkers.length === 0) {
    return null;
  }

  const paramMap = new Map();
  for (const item of parameters) {
    const key = getParamKey(item);
    if (key) {
      paramMap.set(key, item);
    }
  }

  const presentParams = [];
  for (const bioKey of expectedBiomarkers) {
    if (paramMap.has(bioKey)) {
      presentParams.push(paramMap.get(bioKey));
    }
  }

  if (presentParams.length === 0) {
    return {
      domain: {
        name: domainName,
        score: null,
        risk: null,
        confidence: 0,
      },
      warning: riskWarning(
        RISK_WARNING_CODES.INSUFFICIENT_DOMAIN_DATA,
        `No biomarkers present for domain: ${domainName}.`
      ),
    };
  }

  let totalPenalty = 0;
  for (const p of presentParams) {
    const sev = p.severity ?? (p.status === 'NORMAL' ? 'NORMAL' : 'UNKNOWN');
    const penalty = SEVERITY_PENALTIES[sev] ?? SEVERITY_PENALTIES.UNKNOWN;
    totalPenalty += penalty;
    if (p.critical || p.emergency) {
      totalPenalty += 20;
    }
  }

  // Average penalty across present parameters in domain
  const avgPenalty = totalPenalty / presentParams.length;
  const rawScore = Math.max(0, Math.min(100, Math.round(100 - avgPenalty)));

  const risk = classifyRiskLevel(rawScore);

  // Confidence based on coverage of domain biomarkers
  const coverageRatio = presentParams.length / expectedBiomarkers.length;
  // Baseline confidence for 1 parameter is 0.7, scaling up to 0.98–1.0 for full coverage
  const confidence = Number((0.6 + 0.4 * coverageRatio).toFixed(2));

  return {
    domain: {
      name: domainName,
      score: rawScore,
      risk,
      confidence,
    },
    warning: null,
  };
}

export default calculateDomainScore;
