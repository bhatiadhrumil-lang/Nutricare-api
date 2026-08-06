/**
 * contextValidator.js
 * Validates the AI context object for completeness and token budget compliance.
 * Emits structured warnings without throwing — callers decide how to escalate.
 */

export const AI_CONTEXT_WARNING_CODES = Object.freeze({
  INVALID_INPUT_DATA: 'INVALID_INPUT_DATA',
  EMPTY_PARAMETERS: 'EMPTY_PARAMETERS',
  TRUNCATED_CONTEXT: 'TRUNCATED_CONTEXT',
  MISSING_REPORT_SUMMARY: 'MISSING_REPORT_SUMMARY',
  MISSING_AI_INSTRUCTIONS: 'MISSING_AI_INSTRUCTIONS',
  EXCESSIVE_TOKEN_ESTIMATE: 'EXCESSIVE_TOKEN_ESTIMATE',
  MISSING_NUTRITION_CONTEXT: 'MISSING_NUTRITION_CONTEXT',
});

/**
 * Creates a structured warning entry for the metadata.warnings array.
 * @param {string} code   - One of AI_CONTEXT_WARNING_CODES
 * @param {string} message - Human-readable explanation
 * @returns {{ code: string, message: string, level: 'warning' }}
 */
export function contextWarning(code, message) {
  return { code, message, level: 'warning' };
}

/**
 * Rough character-based token estimate (≈ 4 chars / token for English medical text).
 * Used to detect contexts that may exceed Bedrock limits before sending.
 */
const CHARS_PER_TOKEN = 4;
const MAX_RECOMMENDED_TOKENS = 3000;

export function estimateTokens(text = '') {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Validates a fully-assembled AI context object.
 * Returns an array of warnings — empty array means the context is clean.
 *
 * @param {object} aiContext - Output of buildAiContext()
 * @returns {Array<{ code, message, level }>}
 */
export function validateAiContext(aiContext = {}) {
  const warnings = [];

  if (!aiContext || typeof aiContext !== 'object') {
    warnings.push(contextWarning(AI_CONTEXT_WARNING_CODES.INVALID_INPUT_DATA, 'aiContext is null or not an object.'));
    return warnings;
  }

  if (!aiContext.reportSummary || typeof aiContext.reportSummary !== 'object') {
    warnings.push(contextWarning(AI_CONTEXT_WARNING_CODES.MISSING_REPORT_SUMMARY, 'reportSummary is missing from AI context.'));
  }

  if (!aiContext.aiInstructions || typeof aiContext.aiInstructions !== 'object') {
    warnings.push(contextWarning(AI_CONTEXT_WARNING_CODES.MISSING_AI_INSTRUCTIONS, 'aiInstructions are missing from AI context.'));
  }

  if (!aiContext.nutritionContext || Object.keys(aiContext.nutritionContext ?? {}).length === 0) {
    warnings.push(contextWarning(AI_CONTEXT_WARNING_CODES.MISSING_NUTRITION_CONTEXT, 'Nutrition context is empty — no tracked nutrients found in parameters.'));
  }

  // Lightweight token budget check using formatted JSON size
  const serialized = JSON.stringify(aiContext);
  const estimatedTokens = estimateTokens(serialized);
  if (estimatedTokens > MAX_RECOMMENDED_TOKENS) {
    warnings.push(contextWarning(
      AI_CONTEXT_WARNING_CODES.EXCESSIVE_TOKEN_ESTIMATE,
      `Estimated token count (${estimatedTokens}) exceeds the recommended limit of ${MAX_RECOMMENDED_TOKENS}. Consider reducing normalSummary or clinicalPatterns.`,
    ));
  }

  return warnings;
}

export default AI_CONTEXT_WARNING_CODES;
