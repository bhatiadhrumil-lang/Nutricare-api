function getParamKey(item) {
  return item?.id ?? item?.parameter ?? null;
}

export function extractAbnormalAndCritical(parameters = []) {
  const criticalFindings = [];
  const abnormalParameters = [];
  const normalParamKeys = [];

  for (const item of parameters) {
    const key = getParamKey(item);
    const val = item.value ?? item.normalizedValue;
    const status = item.status ?? 'UNKNOWN';
    const severity = item.severity ?? 'NORMAL';

    const isCrit = Boolean(item.critical || item.emergency || status.startsWith('CRITICAL_') || severity.startsWith('CRITICAL_'));
    const isAbnormal = isCrit || (status !== 'NORMAL' && status !== 'UNKNOWN');

    if (isCrit) {
      criticalFindings.push({
        parameter: key,
        value: val,
        status,
        severity,
        clinicalPriority: item.clinicalPriority ?? 'EMERGENCY',
        recommendedAction: item.recommendedAction ?? 'Immediate medical evaluation',
      });
    }

    if (isAbnormal) {
      abnormalParameters.push({
        parameter: key,
        value: val,
        status,
        severity,
        clinicalPriority: item.clinicalPriority ?? 'HIGH',
      });
    } else if (status === 'NORMAL') {
      normalParamKeys.push(key);
    }
  }

  const normalSummary = {
    count: normalParamKeys.length,
    parameters: normalParamKeys,
  };

  return {
    criticalFindings,
    abnormalParameters,
    normalSummary,
  };
}

export default extractAbnormalAndCritical;
