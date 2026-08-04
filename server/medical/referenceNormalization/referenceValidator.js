export const REFERENCE_WARNING_CODES = Object.freeze({
  MISSING_REFERENCE: 'MISSING_REFERENCE', INVALID_FORMAT: 'INVALID_FORMAT',
  UNKNOWN_REFERENCE: 'UNKNOWN_REFERENCE', IMPOSSIBLE_RANGE: 'IMPOSSIBLE_RANGE',
  UNIT_NORMALIZED: 'UNIT_NORMALIZED', UNKNOWN_UNIT: 'UNKNOWN_UNIT',
});

export function warning(code, message) {
  return { code, message, level: 'warning' };
}

export function validateReference(reference) {
  const warnings = [...(reference.warnings ?? [])];
  if (reference.type === 'range' && Number.isFinite(reference.low) && Number.isFinite(reference.high) && reference.low > reference.high) {
    warnings.push(warning(REFERENCE_WARNING_CODES.IMPOSSIBLE_RANGE, `Reference low value ${reference.low} is greater than high value ${reference.high}.`));
  }
  return { ...reference, warnings };
}

export default validateReference;
