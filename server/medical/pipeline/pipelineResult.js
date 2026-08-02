/** Error codes returned inside pipeline metadata; none imply medical meaning. */
export const PIPELINE_ERROR_CODES = Object.freeze({
  EMPTY_OCR: 'EMPTY_OCR',
  NO_PARAMETERS_DETECTED: 'NO_PARAMETERS_DETECTED',
  PARTIAL_EXTRACTION: 'PARTIAL_EXTRACTION',
  PIPELINE_FAILURE: 'PIPELINE_FAILURE',
});

export function createPipelineResult({ metadata, parameters = [], unmatched = [], statistics }) {
  return Object.freeze({
    metadata: Object.freeze(metadata),
    parameters: Object.freeze(parameters),
    unmatched: Object.freeze(unmatched),
    statistics: Object.freeze(statistics),
  });
}

export default createPipelineResult;
