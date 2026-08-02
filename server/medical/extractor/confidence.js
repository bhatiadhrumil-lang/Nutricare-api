/** Calculates extraction confidence only; it makes no clinical judgement. */
export function calculateConfidence({ parameter, value, unit }) {
  if (!parameter || !value) return 0;
  let score = 0.7;
  if (value.comparator) score += 0.03;
  if (unit?.catalogMatch) score += 0.2;
  else if (unit) score += 0.12;
  return Number(Math.min(score, 1).toFixed(2));
}

export default calculateConfidence;
