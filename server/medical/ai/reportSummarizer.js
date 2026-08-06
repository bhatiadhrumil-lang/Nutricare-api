/**
 * reportSummarizer.js
 * Generates a high-level, token-efficient summary of the complete medical report
 * for use as the opening section of the AI context sent to Claude.
 */

/**
 * Maps a 0-100 overall health score to a human-readable clinical category.
 * @param {number} score
 * @returns {string}
 */
function scoreToClinicalCategory(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

/**
 * Builds the reportSummary section for the AI context.
 *
 * @param {object} opts
 * @param {Array}  opts.parameters        - Full parameter array from the pipeline
 * @param {Array}  opts.criticalFindings  - Critical parameter entries (from abnormalContext)
 * @param {Array}  opts.abnormalParameters - Non-critical abnormal entries (from abnormalContext)
 * @param {object} opts.riskSummary       - { overall: number, domains: Array }
 * @param {object} opts.consistencyData   - { score, patterns, contradictions } (optional)
 * @returns {object} reportSummary section
 */
export function summarizeReport({
  parameters = [],
  criticalFindings = [],
  abnormalParameters = [],
  riskSummary = {},
  consistencyData = {},
} = {}) {
  const totalParameters = parameters.length;
  const criticalCount = criticalFindings.length;
  // abnormalParameters includes criticals in the abnorm list, so deduplicate
  const abnormalOnlyCount = abnormalParameters.filter(
    (p) => !criticalFindings.some((c) => c.parameter === p.parameter),
  ).length;
  const normalCount = totalParameters - criticalCount - abnormalOnlyCount;
  const overallHealthScore = typeof riskSummary.overall === 'number' ? riskSummary.overall : 100;

  // Derive clinical status overview from severity of findings
  let clinicalStatusOverview;
  if (criticalCount > 0) {
    clinicalStatusOverview = 'Urgent Clinical Review Required';
  } else if (abnormalOnlyCount > 0) {
    clinicalStatusOverview = `${abnormalOnlyCount} parameter${abnormalOnlyCount > 1 ? 's require' : ' requires'} attention`;
  } else {
    clinicalStatusOverview = 'All evaluated parameters are within reference ranges';
  }

  // Summarize the highest-risk domain if available
  const domains = Array.isArray(riskSummary.domains) ? riskSummary.domains : [];
  const highestRiskDomain = domains.length > 0
    ? domains.reduce((prev, cur) => (cur.score < prev.score ? cur : prev), domains[0])
    : null;

  // Consistency summary (optional)
  const consistencyScore = typeof consistencyData.score === 'number' ? consistencyData.score : null;
  const patternCount = Array.isArray(consistencyData.patterns) ? consistencyData.patterns.length : 0;
  const contradictionCount = Array.isArray(consistencyData.contradictions) ? consistencyData.contradictions.length : 0;

  return {
    totalParameters,
    criticalCount,
    abnormalCount: abnormalOnlyCount,
    normalCount: Math.max(0, normalCount),
    overallHealthScore,
    healthCategory: scoreToClinicalCategory(overallHealthScore),
    clinicalStatusOverview,
    highestRiskDomain: highestRiskDomain
      ? { name: highestRiskDomain.name, score: highestRiskDomain.score, risk: highestRiskDomain.risk }
      : null,
    consistencyScore,
    patternCount,
    contradictionCount,
  };
}

export default summarizeReport;
