const SCORE_BY_LEVEL = Object.freeze({ MILD: 30, MODERATE: 60, SEVERE: 84, CRITICAL: 100, NORMAL: 0 });

export function scoreSeverity(level) {
  return SCORE_BY_LEVEL[level] ?? null;
}

/** Finds the deepest configured threshold reached by a normalized ratio. */
export function classifyLowRatio(ratio, thresholds) {
  if (ratio <= thresholds.critical) return 'CRITICAL';
  if (ratio <= thresholds.severe) return 'SEVERE';
  if (ratio <= thresholds.moderate) return 'MODERATE';
  return 'MILD';
}

export function classifyHighRatio(ratio, thresholds) {
  if (ratio >= thresholds.critical) return 'CRITICAL';
  if (ratio >= thresholds.severe) return 'SEVERE';
  if (ratio >= thresholds.moderate) return 'MODERATE';
  return 'MILD';
}

export default scoreSeverity;
