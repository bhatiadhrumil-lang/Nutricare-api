/**
 * Generates a high-level summary of the medical report for AI context.
 */
export function summarizeReport({ parameters = [], criticalFindings = [], abnormalParameters = [], riskSummary = {} } = {}) {
  const totalParameters = parameters.length;
  const abnormalCount = abnormalParameters.length;
  const criticalCount = criticalFindings.length;
  const overallHealthScore = riskSummary?.overall ?? 100;

  let clinicalStatusOverview = 'Optimal';
  if (criticalCount > 0) {
    clinicalStatusOverview = 'Urgent Clinical Review Required';
  } else if (abnormalCount > 0) {
    clinicalStatusOverview = 'Needs Attention';
  }

  return {
    totalParameters,
    abnormalCount,
    criticalCount,
    overallHealthScore,
    clinicalStatusOverview,
  };
}

export default summarizeReport;
