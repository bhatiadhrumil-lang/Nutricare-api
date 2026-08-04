import { calculateDeviation, calculateRangeDistance } from './deviationCalculator.js';

function result(status, withinReference, metrics) {
  return { status, withinReference, ...metrics };
}

/** Compares a finite numeric value with one normalized numeric reference. */
export function compareNumericReference(value, reference) {
  if (reference.type === 'range') {
    if (value < reference.low) return result(reference.criticalLow !== undefined && value <= reference.criticalLow ? 'CRITICAL_LOW' : 'LOW', false, calculateRangeDistance(value, reference.low, reference.high));
    if (value > reference.high) return result(reference.criticalHigh !== undefined && value >= reference.criticalHigh ? 'CRITICAL_HIGH' : 'HIGH', false, calculateRangeDistance(value, reference.low, reference.high));
    return result('NORMAL', true, calculateRangeDistance(value, reference.low, reference.high));
  }
  if (reference.type === 'upper-limit') {
    const exceeds = reference.inclusiveHigh ? value > reference.high : value >= reference.high;
    if (exceeds) return result(reference.criticalHigh !== undefined && value >= reference.criticalHigh ? 'CRITICAL_HIGH' : 'HIGH', false, calculateDeviation(value, reference.high));
    return result('NORMAL', true, { deviation: 0, deviationPercent: 0, distanceFromBoundary: Math.abs(reference.high - value) });
  }
  if (reference.type === 'lower-limit') {
    const below = reference.inclusiveLow ? value < reference.low : value <= reference.low;
    if (below) return result(reference.criticalLow !== undefined && value <= reference.criticalLow ? 'CRITICAL_LOW' : 'LOW', false, calculateDeviation(value, reference.low));
    return result('NORMAL', true, { deviation: 0, deviationPercent: 0, distanceFromBoundary: Math.abs(value - reference.low) });
  }
  return null;
}

export default compareNumericReference;
