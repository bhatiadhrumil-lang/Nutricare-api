export const AI_CONTEXT_WARNING_CODES = Object.freeze({
  INVALID_INPUT_DATA: 'INVALID_INPUT_DATA',
  EMPTY_PARAMETERS: 'EMPTY_PARAMETERS',
  TRUNCATED_CONTEXT: 'TRUNCATED_CONTEXT',
});

export function contextWarning(code, message) {
  return { code, message, level: 'warning' };
}

export default AI_CONTEXT_WARNING_CODES;
