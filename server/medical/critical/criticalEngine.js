import { CRITICAL_RULES } from './criticalRules.js';
import { EMERGENCY_RULES, EMERGENCY_LEVELS } from './emergencyRules.js';
import { generateAlert } from './alertGenerator.js';
import { CRITICAL_WARNING_CODES, criticalWarning } from './criticalValidator.js';
import { CANONICAL_UNITS } from '../normalization/canonicalUnits.js';

function unknownResult(input, warnings) {
  const param = input?.parameter ?? input?.id ?? null;
  const status = input?.status ?? 'UNKNOWN';
  const severity = input?.severity ?? 'UNKNOWN';
  const alertInfo = generateAlert({ isCritical: false, isEmergency: false, emergencyLevel: EMERGENCY_LEVELS.NONE, status, severity });

  return {
    parameter: param,
    status,
    severity,
    critical: false,
    emergency: false,
    alertLevel: alertInfo.alertLevel,
    clinicalPriority: alertInfo.clinicalPriority,
    recommendedAction: alertInfo.recommendedAction,
    aiPriority: alertInfo.aiPriority,
    warnings,
  };
}

/**
 * Evaluates laboratory results to detect critical and life-threatening values
 * using external configurable rules. Does not alter previous pipeline stages.
 */
export function detectCriticalValues(input = {}) {
  const param = input.parameter ?? input.id;
  if (!param || typeof param !== 'string') {
    return unknownResult(input, [criticalWarning(CRITICAL_WARNING_CODES.UNKNOWN_PARAMETER, 'A valid parameter ID is required.')]);
  }

  const status = input.status ?? 'UNKNOWN';
  const severity = input.severity ?? 'UNKNOWN';
  const val = input.value ?? input.normalizedValue;
  const warnings = [];

  const critRule = CRITICAL_RULES[param];
  const emergRule = EMERGENCY_RULES[param];

  if (!critRule && !emergRule) {
    const isKnownBiomarker = Boolean(CANONICAL_UNITS[param]);
    const code = isKnownBiomarker ? CRITICAL_WARNING_CODES.MISSING_CRITICAL_RULE : CRITICAL_WARNING_CODES.UNKNOWN_PARAMETER;
    const msg = isKnownBiomarker ? `No critical rule configured for ${param}.` : `Unknown biomarker parameter: ${param}.`;
    warnings.push(criticalWarning(code, msg));
  }

  const isNumeric = typeof val === 'number' && Number.isFinite(val);
  if (!isNumeric && val !== undefined && val !== null) {
    warnings.push(criticalWarning(CRITICAL_WARNING_CODES.INVALID_VALUE, 'Critical value detection requires a finite numeric value.'));
  } else if (val === undefined || val === null) {
    warnings.push(criticalWarning(CRITICAL_WARNING_CODES.MISSING_VALUE, 'A numeric value is required for critical threshold comparison.'));
  }

  let isCriticalLow = false;
  let isCriticalHigh = false;
  if (isNumeric && critRule) {
    if (Number.isFinite(critRule.low) && val <= critRule.low) {
      isCriticalLow = true;
    }
    if (Number.isFinite(critRule.high) && val >= critRule.high) {
      isCriticalHigh = true;
    }
  }

  let isEmergencyLow = false;
  let isEmergencyHigh = false;
  if (isNumeric && emergRule) {
    if (Number.isFinite(emergRule.low) && val <= emergRule.low) {
      isEmergencyLow = true;
    }
    if (Number.isFinite(emergRule.high) && val >= emergRule.high) {
      isEmergencyHigh = true;
    }
  }

  const isCritical = isCriticalLow || isCriticalHigh || status.startsWith('CRITICAL_') || severity.startsWith('CRITICAL_');
  const isEmergency = isEmergencyLow || isEmergencyHigh || status.startsWith('CRITICAL_') || severity.startsWith('CRITICAL_');

  let emergencyLevel = EMERGENCY_LEVELS.NONE;
  if (isEmergencyLow || isEmergencyHigh) {
    emergencyLevel = EMERGENCY_LEVELS.LIFE_THREATENING;
  } else if (isCriticalLow || isCriticalHigh || status.startsWith('CRITICAL_') || severity.startsWith('CRITICAL_')) {
    emergencyLevel = EMERGENCY_LEVELS.EMERGENCY;
  } else if (severity.startsWith('SEVERE_')) {
    emergencyLevel = EMERGENCY_LEVELS.URGENT;
  }

  const alertInfo = generateAlert({
    isCritical,
    isEmergency,
    emergencyLevel,
    status,
    severity,
  });

  return {
    parameter: param,
    status,
    severity,
    critical: isCritical,
    emergency: isEmergency,
    alertLevel: alertInfo.alertLevel,
    clinicalPriority: alertInfo.clinicalPriority,
    recommendedAction: alertInfo.recommendedAction,
    aiPriority: alertInfo.aiPriority,
    warnings,
  };
}

export default detectCriticalValues;
