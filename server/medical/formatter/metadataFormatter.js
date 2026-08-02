/**
 * Formats non-clinical report metadata for the canonical medical document.
 * OCR can populate laboratory and patient identity fields in a later phase.
 */
export function formatMetadata(pipelineMetadata = {}, pipelineStatistics = {}, options = {}) {
  const sourceType = pipelineMetadata.sourceType ?? null;
  return {
    reportType: options.reportType ?? sourceType ?? 'laboratory_report',
    laboratory: options.laboratory ?? pipelineMetadata.laboratory ?? null,
    pageCount: pipelineMetadata.pageCount ?? null,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    processingTime: pipelineStatistics.processingDurationMs ?? null,
    sourceType,
    fileName: pipelineMetadata.fileName ?? null,
  };
}

/** Returns intentionally empty patient fields until OCR supplies them. */
export function formatPatient(patient = {}) {
  return {
    name: patient.name ?? null,
    age: patient.age ?? null,
    gender: patient.gender ?? null,
  };
}

export default formatMetadata;
