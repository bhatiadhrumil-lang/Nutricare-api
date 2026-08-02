const WARNING_CODES = new Set(['PARTIAL_EXTRACTION']);

/**
 * Separates recoverable extraction warnings from validation errors. Pipeline
 * error objects are retained unchanged to preserve their operational context.
 */
export function formatValidation(pipelineMetadata = {}) {
  const warnings = [];
  const errors = [];

  for (const issue of pipelineMetadata.errors ?? []) {
    if (WARNING_CODES.has(issue.code)) warnings.push({ ...issue });
    else errors.push({ ...issue });
  }

  return { warnings, errors, valid: errors.length === 0 };
}

export default formatValidation;
