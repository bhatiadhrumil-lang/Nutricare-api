/**
 * Generates behavioral and safety instructions for Claude (AWS Bedrock).
 */
export function buildAiInstructions({ hasCritical = false, hasAbnormal = false } = {}) {
  return {
    tone: 'Professional, empathetic, educational, non-diagnostic',
    language: 'Clear, accessible, layperson-friendly',
    avoidDiagnosis: true,
    recommendNutrition: true,
    recommendDoctorWhenCritical: hasCritical,
    highlightCriticalValues: hasCritical || hasAbnormal,
    disclaimer: 'This is not medical advice. Please consult a qualified healthcare professional.',
  };
}

export default buildAiInstructions;
