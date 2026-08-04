import { SEVERITY_RULES } from './severityRules.js';
import { CANONICAL_UNITS } from '../normalization/canonicalUnits.js';
import { classifyHighRatio, classifyLowRatio, scoreSeverity } from './deviationScoring.js';
import { priorityForSeverity } from './priorityEngine.js';
import { SEVERITY_WARNING_CODES, severityWarning } from './severityValidator.js';

function unknown(input, warnings) {
  return { id: input.id ?? null, value: input.value, status: input.status ?? 'UNKNOWN', severity: 'UNKNOWN', severityScore: null, clinicalPriority: null, warnings };
}

function boundaryFor(status, reference) {
  if (status.endsWith('LOW')) return reference?.low;
  if (status.endsWith('HIGH')) return reference?.high;
  return null;
}

/**
 * Applies a parameter policy to an already-calculated status. Rules are keyed
 * by canonical parameter ID and can be extended without changing comparison
 * behavior or previous stages.
 */
export function classifySeverity(input = {}) {
  const { id, value, status, reference } = input;
  if (!id || typeof id !== 'string') return unknown(input, [severityWarning(SEVERITY_WARNING_CODES.UNKNOWN_PARAMETER, 'A canonical parameter ID is required.')]);
  const rule = SEVERITY_RULES[id];
  if (!rule) {
    const code = CANONICAL_UNITS[id] ? SEVERITY_WARNING_CODES.MISSING_SEVERITY_RULE : SEVERITY_WARNING_CODES.UNKNOWN_PARAMETER;
    return unknown(input, [severityWarning(code, CANONICAL_UNITS[id] ? `No severity rule is configured for ${id}.` : `Unknown parameter ID: ${id}.`)]);
  }
  if (status === 'NORMAL') return { id, value, status, severity: 'NORMAL', severityScore: 0, clinicalPriority: 'LOW', warnings: [] };
  if (!status || status === 'UNKNOWN') return unknown(input, [severityWarning(SEVERITY_WARNING_CODES.UNKNOWN_STATUS, 'A comparable LOW, HIGH, or NORMAL status is required.')]);
  if (typeof value !== 'number' || !Number.isFinite(value)) return unknown(input, [severityWarning(SEVERITY_WARNING_CODES.INVALID_VALUE, 'Severity requires a finite normalized numeric value.')]);
  const direction = status.endsWith('LOW') ? 'low' : status.endsWith('HIGH') ? 'high' : null;
  const boundary = boundaryFor(status, reference);
  if (!direction || !Number.isFinite(boundary) || boundary === 0) return unknown(input, [severityWarning(SEVERITY_WARNING_CODES.MISSING_REFERENCE, 'A non-zero normalized reference boundary is required.')]);
  const thresholds = rule[direction];
  if (!thresholds) return unknown(input, [severityWarning(SEVERITY_WARNING_CODES.MISSING_SEVERITY_RULE, `No ${direction} severity rule is configured for ${id}.`)]);

  // Explicit critical status from the previous phase is preserved.
  const level = status.startsWith('CRITICAL_') ? 'CRITICAL' : direction === 'low'
    ? classifyLowRatio(value / boundary, thresholds)
    : classifyHighRatio(value / boundary, thresholds);
  return { id, value, status, severity: `${level}_${direction.toUpperCase()}`, severityScore: scoreSeverity(level), clinicalPriority: priorityForSeverity(level, status), warnings: [] };
}

export default classifySeverity;
