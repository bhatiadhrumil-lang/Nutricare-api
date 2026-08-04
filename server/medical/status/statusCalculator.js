import { compareNumericReference } from './comparisonEngine.js';
import { compareQualitativeReference } from './qualitativeComparator.js';

export const STATUS_WARNING_CODES = Object.freeze({
  MISSING_REFERENCE: 'MISSING_REFERENCE', MALFORMED_REFERENCE: 'MALFORMED_REFERENCE',
  MISSING_VALUE: 'MISSING_VALUE', INVALID_NUMERIC_VALUE: 'INVALID_NUMERIC_VALUE',
  UNKNOWN_REFERENCE: 'UNKNOWN_REFERENCE',
});

function warning(code, message) {
  return { code, message, level: 'warning' };
}

function unknown(parameter, normalizedValue, reference, warnings) {
  return { parameter, normalizedValue, reference: reference ?? null, status: 'UNKNOWN', withinReference: false, deviation: null, deviationPercent: null, distanceFromBoundary: null, warnings };
}

function hasMalformedNumericReference(reference) {
  if (reference.type === 'range') return !Number.isFinite(reference.low) || !Number.isFinite(reference.high) || reference.low > reference.high;
  if (reference.type === 'upper-limit') return !Number.isFinite(reference.high);
  if (reference.type === 'lower-limit') return !Number.isFinite(reference.low);
  return false;
}

/**
 * Calculates a non-throwing status from already-normalized inputs. `parameter`
 * may be an ID or display name; no extraction, unit, or reference mutation is
 * performed here.
 */
export function calculateMedicalStatus({ parameter = null, normalizedValue, reference = null } = {}) {
  if (!reference || reference.type === 'missing') return unknown(parameter, normalizedValue, reference, [warning(STATUS_WARNING_CODES.MISSING_REFERENCE, 'A normalized reference is required to calculate status.')]);
  if (reference.type === 'invalid') return unknown(parameter, normalizedValue, reference, [warning(STATUS_WARNING_CODES.MALFORMED_REFERENCE, 'The normalized reference has an invalid format.')]);
  if (reference.type === 'unknown' || reference.type === 'demographic') return unknown(parameter, normalizedValue, reference, [warning(STATUS_WARNING_CODES.UNKNOWN_REFERENCE, 'The reference cannot be compared safely.')]);
  if (hasMalformedNumericReference(reference)) return unknown(parameter, normalizedValue, reference, [warning(STATUS_WARNING_CODES.MALFORMED_REFERENCE, 'The normalized numeric reference has invalid boundaries.')]);
  if (normalizedValue === null || normalizedValue === undefined || normalizedValue === '') return unknown(parameter, normalizedValue, reference, [warning(STATUS_WARNING_CODES.MISSING_VALUE, 'A normalized value is required to calculate status.')]);

  const isQualitative = reference.type === 'qualitative' || reference.type === 'risk-category';
  if (isQualitative) {
    const comparison = compareQualitativeReference(normalizedValue, reference);
    return comparison ? { parameter, normalizedValue, reference, ...comparison, warnings: [] } : unknown(parameter, normalizedValue, reference, [warning(STATUS_WARNING_CODES.INVALID_NUMERIC_VALUE, 'A qualitative value is required for this reference.')]);
  }
  if (typeof normalizedValue !== 'number' || !Number.isFinite(normalizedValue)) return unknown(parameter, normalizedValue, reference, [warning(STATUS_WARNING_CODES.INVALID_NUMERIC_VALUE, 'Normalized value must be a finite number.')]);
  const comparison = compareNumericReference(normalizedValue, reference);
  return comparison ? { parameter, normalizedValue, reference, ...comparison, warnings: [] } : unknown(parameter, normalizedValue, reference, [warning(STATUS_WARNING_CODES.UNKNOWN_REFERENCE, 'The reference type is not comparable.')]);
}

export default calculateMedicalStatus;
