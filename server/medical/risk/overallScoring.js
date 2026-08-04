import { DOMAIN_WEIGHTS } from './weightConfiguration.js';

/**
 * Computes overall health score as a clinically weighted average of domain scores.
 */
export function calculateOverallScore(domainResults = [], weights = DOMAIN_WEIGHTS) {
  if (!Array.isArray(domainResults) || domainResults.length === 0) {
    return 100;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const domain of domainResults) {
    if (!domain || typeof domain.score !== 'number' || isNaN(domain.score)) {
      continue;
    }

    const weight = weights[domain.name] ?? 1.0;
    weightedSum += domain.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 100;
  }

  return Math.max(0, Math.min(100, Math.round(weightedSum / totalWeight)));
}

export default calculateOverallScore;
