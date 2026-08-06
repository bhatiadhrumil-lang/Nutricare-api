/**
 * promptContext.js
 * Generates the aiInstructions section for the AI context sent to Claude (AWS Bedrock).
 *
 * These instructions define Claude's behavioral rules for the NutriHealth domain:
 *   - Tone and communication style
 *   - Diagnosis avoidance
 *   - Nutrition recommendation enablement
 *   - Critical value escalation logic
 *   - Safety disclaimers
 */

/**
 * @typedef {object} AiInstructions
 * @property {string}  tone                         - Communication style directive
 * @property {string}  language                     - Language level directive
 * @property {boolean} avoidDiagnosis               - Never diagnose conditions
 * @property {boolean} recommendNutrition           - Recommend dietary adjustments where relevant
 * @property {boolean} recommendDoctorWhenCritical  - Escalate critical findings to physician urgency
 * @property {boolean} highlightCriticalValues      - Whether to draw special attention to critical values
 * @property {boolean} summarizeNormalValues       - Summarize normals as a group instead of listing each
 * @property {string}  urgencyLevel                 - NORMAL | ELEVATED | CRITICAL
 * @property {string}  responseFormat               - How Claude should structure its response
 * @property {string}  disclaimer                   - Mandatory safety disclaimer
 */

/**
 * Derives the urgencyLevel directive based on the presence of critical/abnormal findings.
 * @param {boolean} hasCritical
 * @param {boolean} hasAbnormal
 * @returns {'NORMAL'|'ELEVATED'|'CRITICAL'}
 */
function deriveUrgencyLevel(hasCritical, hasAbnormal) {
  if (hasCritical) return 'CRITICAL';
  if (hasAbnormal) return 'ELEVATED';
  return 'NORMAL';
}

/**
 * Builds the aiInstructions block that forms the behavioral directive section
 * of the AI context sent to Claude.
 *
 * @param {object}  opts
 * @param {boolean} [opts.hasCritical=false]  - True if any critical findings exist
 * @param {boolean} [opts.hasAbnormal=false]  - True if any abnormal (non-critical) findings exist
 * @param {boolean} [opts.hasNutritionFocus=false] - True if any nutrition areas require focus
 * @returns {AiInstructions}
 */
export function buildAiInstructions({
  hasCritical = false,
  hasAbnormal = false,
  hasNutritionFocus = false,
} = {}) {
  const urgencyLevel = deriveUrgencyLevel(hasCritical, hasAbnormal);

  return {
    tone: hasCritical
      ? 'Urgent, empathetic, clear — prioritize safety communication'
      : 'Professional, warm, educational, non-alarming',
    language: 'Clear and accessible. Avoid clinical jargon. Explain technical terms in plain language a layperson can understand.',
    avoidDiagnosis: true,
    recommendNutrition: true,
    recommendDoctorWhenCritical: hasCritical,
    highlightCriticalValues: hasCritical || hasAbnormal,
    summarizeNormalValues: true,
    hasNutritionFocus,
    urgencyLevel,
    responseFormat:
      'Structure your response with: (1) Brief overview, (2) Key findings explained simply, (3) Nutrition & lifestyle guidance, (4) When to see a doctor. Keep each section concise.',
    disclaimer: 'This information is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis, treatment, or medical decisions.',
    criticalInstruction: hasCritical
      ? 'IMPORTANT: One or more values are at critical or life-threatening levels. Clearly and calmly communicate the urgency of seeking immediate medical evaluation. Do NOT minimize these findings.'
      : null,
  };
}

export default buildAiInstructions;
