const PRIORITY_BY_LEVEL = Object.freeze({ NORMAL: 'LOW', MILD: 'LOW', MODERATE: 'MEDIUM', SEVERE: 'HIGH' });

export function priorityForSeverity(level, status = '') {
  if (level === 'CRITICAL') return status.startsWith('CRITICAL_') ? 'EMERGENCY' : 'URGENT';
  return PRIORITY_BY_LEVEL[level] ?? null;
}

export default priorityForSeverity;
