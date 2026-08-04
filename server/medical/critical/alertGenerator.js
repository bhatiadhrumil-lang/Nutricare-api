export const ALERT_LEVELS = Object.freeze({
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  ORANGE: 'ORANGE',
  RED: 'RED',
});

/**
 * Generates alert level, clinical priority, recommended action, and AI priority
 * from critical evaluation flags, emergency levels, status, and severity.
 */
export function generateAlert({ isCritical = false, isEmergency = false, emergencyLevel = 'NONE', status = '', severity = '' } = {}) {
  if (emergencyLevel === 'LIFE_THREATENING') {
    return {
      alertLevel: ALERT_LEVELS.RED,
      clinicalPriority: 'EMERGENCY',
      recommendedAction: 'Immediate emergency intervention required',
      aiPriority: 100,
    };
  }

  if (isEmergency || (isCritical && (severity.startsWith('CRITICAL_') || status.startsWith('CRITICAL_')))) {
    return {
      alertLevel: ALERT_LEVELS.RED,
      clinicalPriority: 'EMERGENCY',
      recommendedAction: 'Immediate medical evaluation',
      aiPriority: 100,
    };
  }

  if (isCritical) {
    return {
      alertLevel: ALERT_LEVELS.RED,
      clinicalPriority: 'EMERGENCY',
      recommendedAction: 'Immediate medical evaluation',
      aiPriority: 100,
    };
  }

  if (emergencyLevel === 'URGENT' || severity.startsWith('SEVERE_')) {
    return {
      alertLevel: ALERT_LEVELS.ORANGE,
      clinicalPriority: 'URGENT',
      recommendedAction: 'Urgent clinical review recommended',
      aiPriority: 75,
    };
  }

  if (severity.startsWith('MODERATE_') || status === 'LOW' || status === 'HIGH') {
    return {
      alertLevel: ALERT_LEVELS.YELLOW,
      clinicalPriority: 'MEDIUM',
      recommendedAction: 'Schedule medical follow-up',
      aiPriority: 50,
    };
  }

  if (severity.startsWith('MILD_')) {
    return {
      alertLevel: ALERT_LEVELS.YELLOW,
      clinicalPriority: 'LOW',
      recommendedAction: 'Monitor during next checkup',
      aiPriority: 30,
    };
  }

  return {
    alertLevel: ALERT_LEVELS.GREEN,
    clinicalPriority: 'LOW',
    recommendedAction: 'Routine monitoring',
    aiPriority: 10,
  };
}

export default generateAlert;
