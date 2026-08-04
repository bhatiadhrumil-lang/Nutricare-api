export const CRITICAL_WARNING_CODES = Object.freeze({
  UNKNOWN_PARAMETER: 'UNKNOWN_PARAMETER',
  MISSING_CRITICAL_RULE: 'MISSING_CRITICAL_RULE',
  MISSING_VALUE: 'MISSING_VALUE',
  INVALID_VALUE: 'INVALID_VALUE',
  UNKNOWN_STATUS: 'UNKNOWN_STATUS',
});

export function criticalWarning(code, message) {
  return { code, message, level: 'warning' };
}

export default CRITICAL_WARNING_CODES;
