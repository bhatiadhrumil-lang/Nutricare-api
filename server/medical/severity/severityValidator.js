export const SEVERITY_WARNING_CODES = Object.freeze({
  UNKNOWN_PARAMETER: 'UNKNOWN_PARAMETER', MISSING_SEVERITY_RULE: 'MISSING_SEVERITY_RULE',
  MISSING_REFERENCE: 'MISSING_REFERENCE', INVALID_VALUE: 'INVALID_VALUE', UNKNOWN_STATUS: 'UNKNOWN_STATUS',
});

export function severityWarning(code, message) {
  return { code, message, level: 'warning' };
}

export default SEVERITY_WARNING_CODES;
