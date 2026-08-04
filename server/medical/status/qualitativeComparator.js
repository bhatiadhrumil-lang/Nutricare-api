/**
 * Qualitative values cannot be ranked safely. A normalized exact match is
 * normal; a different recognized value is retained as UNKNOWN rather than
 * clinically labelling it high or low.
 */
export function compareQualitativeReference(value, reference) {
  if (typeof value !== 'string' || !reference?.value) return null;
  const normalizedValue = value.trim().toLocaleLowerCase().replace(/[\s-]+/gu, '_');
  const matches = normalizedValue === reference.value;
  return {
    status: matches ? 'NORMAL' : 'UNKNOWN',
    withinReference: matches,
    deviation: null,
    deviationPercent: null,
    distanceFromBoundary: null,
  };
}

export default compareQualitativeReference;
