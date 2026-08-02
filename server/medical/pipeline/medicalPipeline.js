import { extractMedicalParameters } from '../extractor/extractor.js';
import { parseReferenceRange } from '../reference/referenceParser.js';
import { createPipelineMetrics } from './pipelineMetrics.js';
import { createPipelineResult, PIPELINE_ERROR_CODES } from './pipelineResult.js';

function createMetadata({ sourceType = null, fileName = null, pageCount = null }, errors = []) {
  return {
    sourceType,
    fileName,
    pageCount,
    errors,
  };
}

function countOcrLines(rawText) {
  return rawText.split(/\r?\n/u).filter((line) => line.trim()).length;
}

function attachReferenceRanges(parameters) {
  return parameters.map((parameter) => ({
    ...parameter,
    referenceRange: parameter.referenceRange === null ? null : parseReferenceRange(parameter.referenceRange),
  }));
}

/**
 * Reusable integration point for OCR-derived medical text. Extraction remains
 * single-pass: aliases are resolved by the existing extractor and only its
 * already-isolated raw reference fields are handed to the reference parser.
 */
export async function process({ rawText, sourceType = null, fileName = null, pageCount = null } = {}) {
  const startedAt = performance.now();
  const input = { sourceType, fileName, pageCount };

  if (typeof rawText !== 'string' || !rawText.trim()) {
    const statistics = createPipelineMetrics({ lines: 0, parameters: [], unmatched: [], durationMs: performance.now() - startedAt });
    return createPipelineResult({
      metadata: createMetadata(input, [{ code: PIPELINE_ERROR_CODES.EMPTY_OCR, message: 'No OCR text was available for processing.' }]),
      parameters: [],
      unmatched: [],
      statistics,
    });
  }

  try {
    const extraction = extractMedicalParameters(rawText);
    const parameters = attachReferenceRanges(extraction.parameters);
    const errors = [];
    if (parameters.length === 0) {
      errors.push({ code: PIPELINE_ERROR_CODES.NO_PARAMETERS_DETECTED, message: 'No catalog parameters were detected in the OCR text.' });
    }
    if (extraction.unmatched.length > 0) {
      errors.push({ code: PIPELINE_ERROR_CODES.PARTIAL_EXTRACTION, message: 'Some OCR lines could not be extracted.' });
    }

    return createPipelineResult({
      metadata: createMetadata(input, errors),
      parameters,
      unmatched: extraction.unmatched,
      statistics: createPipelineMetrics({
        lines: countOcrLines(rawText),
        parameters,
        unmatched: extraction.unmatched,
        durationMs: performance.now() - startedAt,
      }),
    });
  } catch (error) {
    const statistics = createPipelineMetrics({
      lines: countOcrLines(rawText), parameters: [], unmatched: [], durationMs: performance.now() - startedAt,
    });
    return createPipelineResult({
      metadata: createMetadata(input, [{ code: PIPELINE_ERROR_CODES.PIPELINE_FAILURE, message: error.message || 'Medical pipeline failed.' }]),
      parameters: [],
      unmatched: [],
      statistics,
    });
  }
}

const medicalPipeline = Object.freeze({ process });
export default medicalPipeline;
