/**
 * abnormalContext.js
 * Separates pipeline parameters into three buckets:
 *   1. criticalFindings  — parameters flagged critical or emergency
 *   2. abnormalParameters — parameters outside reference range (non-critical)
 *   3. normalSummary     — compact summary of normal parameters (no per-param duplication)
 *
 * Token efficiency: normal parameters are intentionally summarized as a count+names list,
 * not expanded individually.
 */

function getParamKey(item) {
  return item?.id ?? item?.parameter ?? null;
}

/**
 * Formats a parameter value with its unit for display.
 * @param {*} val
 * @param {string|undefined} unit
 * @returns {string}
 */
function formatValue(val, unit) {
  if (val === null || val === undefined) return 'N/A';
  return unit ? `${val} ${unit}` : String(val);
}

/**
 * Determines whether a parameter qualifies as "critical" based on flags, status, or severity.
 * @param {object} item
 * @returns {boolean}
 */
function isCriticalParam(item) {
  const status = item.status ?? '';
  const severity = item.severity ?? '';
  return Boolean(
    item.critical ||
    item.emergency ||
    status.startsWith('CRITICAL_') ||
    severity.startsWith('CRITICAL_'),
  );
}

/**
 * Determines whether a parameter is abnormal (outside reference range).
 * Critical parameters are also abnormal.
 * @param {object} item
 * @param {boolean} isCrit
 * @returns {boolean}
 */
function isAbnormalParam(item, isCrit) {
  if (isCrit) return true;
  const status = item.status ?? 'UNKNOWN';
  return status !== 'NORMAL' && status !== 'UNKNOWN';
}

/**
 * Extracts a direction hint from status for display (LOW / HIGH / etc.).
 * @param {string} status
 * @returns {string|null}
 */
function directionFromStatus(status) {
  if (!status) return null;
  if (status.endsWith('_LOW') || status === 'LOW') return 'LOW';
  if (status.endsWith('_HIGH') || status === 'HIGH') return 'HIGH';
  return null;
}

/**
 * Separates parameters into critical, abnormal, and normal buckets.
 * Critical items appear in both criticalFindings AND abnormalParameters
 * so Claude has them in both sections for full context.
 *
 * @param {Array} parameters - Enriched parameter array from the full pipeline
 * @returns {{ criticalFindings: Array, abnormalParameters: Array, normalSummary: object }}
 */
export function extractAbnormalAndCritical(parameters = []) {
  const criticalFindings = [];
  const abnormalParameters = [];
  const normalParamKeys = [];

  for (const item of parameters) {
    if (!item || typeof item !== 'object') continue;

    const key = getParamKey(item);
    const val = item.normalizedValue ?? item.value;
    const unit = item.normalizedUnit ?? item.unit ?? null;
    const status = item.status ?? 'UNKNOWN';
    const severity = item.severity ?? 'NORMAL';
    const displayValue = formatValue(val, unit);

    const isCrit = isCriticalParam(item);
    const isAbnorm = isAbnormalParam(item, isCrit);
    const direction = directionFromStatus(status);

    if (isCrit) {
      criticalFindings.push({
        parameter: key,
        value: displayValue,
        status,
        severity,
        direction,
        clinicalPriority: item.clinicalPriority ?? 'EMERGENCY',
        recommendedAction: item.recommendedAction ?? 'Immediate medical evaluation required',
        aiPriority: item.aiPriority ?? 'HIGH',
        emergency: Boolean(item.emergency),
        alertLevel: item.alertLevel ?? 'CRITICAL',
      });
    }

    if (isAbnorm) {
      abnormalParameters.push({
        parameter: key,
        value: displayValue,
        status,
        severity,
        direction,
        clinicalPriority: item.clinicalPriority ?? (isCrit ? 'EMERGENCY' : 'HIGH'),
      });
    } else if (status === 'NORMAL') {
      normalParamKeys.push(key);
    }
  }

  // Token-efficient normal summary: count + list of names only
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
