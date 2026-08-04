export const RISK_WARNING_CODES = Object.freeze({
  UNKNOWN_PARAMETER: 'UNKNOWN_PARAMETER',
  INSUFFICIENT_DOMAIN_DATA: 'INSUFFICIENT_DOMAIN_DATA',
  MISSING_INPUT: 'MISSING_INPUT',
  INVALID_BIOMARKER_VALUE: 'INVALID_BIOMARKER_VALUE',
});

export function riskWarning(code, message) {
  return { code, message, level: 'warning' };
}

export default RISK_WARNING_CODES;
