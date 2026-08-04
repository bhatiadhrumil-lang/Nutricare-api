/** Numeric distance helpers kept separate from clinical status classification. */
export function calculateDeviation(value, boundary) {
  const deviation = Math.abs(value - boundary);
  return {
    deviation,
    deviationPercent: boundary === 0 ? null : (deviation / Math.abs(boundary)) * 100,
    distanceFromBoundary: deviation,
  };
}

export function calculateRangeDistance(value, low, high) {
  if (value < low) return calculateDeviation(value, low);
  if (value > high) return calculateDeviation(value, high);
  return {
    deviation: 0,
    deviationPercent: 0,
    distanceFromBoundary: Math.min(Math.abs(value - low), Math.abs(high - value)),
  };
}

export default calculateDeviation;
