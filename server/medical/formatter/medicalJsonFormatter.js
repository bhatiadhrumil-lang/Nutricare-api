import { formatMetadata, formatPatient } from './metadataFormatter.js';
import { formatStatistics } from './statisticsFormatter.js';
import { formatValidation } from './validationFormatter.js';

export const MEDICAL_JSON_VERSION = '1.0.0';

/**
 * Transforms a Medical Pipeline result into the canonical document consumed by
 * downstream features. It performs no OCR, extraction, normalization, or
 * medical interpretation.
 *
 * @param {{ metadata?: object, parameters?: object[], statistics?: object }} pipelineResult Existing pipeline output.
 * @param {{ version?: string, reportType?: string, laboratory?: string|null, generatedAt?: string, patient?: object }} [options] Presentation metadata only.
 * @returns {{ version: string, metadata: object, patient: object, parameters: object[], statistics: object, validation: object }} Canonical medical JSON.
 */
export function formatMedicalJson(pipelineResult, options = {}) {
  if (!pipelineResult || typeof pipelineResult !== 'object') {
    throw new TypeError('A Medical Pipeline result is required to format medical JSON.');
  }

  return {
    version: options.version ?? MEDICAL_JSON_VERSION,
    metadata: formatMetadata(pipelineResult.metadata, pipelineResult.statistics, options),
    patient: formatPatient(options.patient),
    parameters: (pipelineResult.parameters ?? []).map((parameter) => ({ ...parameter })),
    statistics: formatStatistics(pipelineResult.statistics),
    validation: formatValidation(pipelineResult.metadata),
  };
}

const medicalJsonFormatter = Object.freeze({ format: formatMedicalJson });
export default medicalJsonFormatter;
