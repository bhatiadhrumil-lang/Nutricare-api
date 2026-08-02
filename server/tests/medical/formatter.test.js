const assert = require('node:assert/strict');
const test = require('node:test');

test('formats pipeline output into the canonical medical JSON document', async () => {
  const [
    { default: medicalPipeline },
    { formatMedicalJson, MEDICAL_JSON_VERSION },
  ] = await Promise.all([
    import('../../medical/pipeline/medicalPipeline.js'),
    import('../../medical/formatter/medicalJsonFormatter.js'),
  ]);
  const pipelineResult = await medicalPipeline.process({
    rawText: 'Hb 13.5 g/dL 13 - 17\nUnrecognized content',
    sourceType: 'application/pdf',
    fileName: 'report.pdf',
    pageCount: 1,
  });
  const document = formatMedicalJson(pipelineResult, {
    laboratory: 'Example Laboratory',
    generatedAt: '2026-08-01T00:00:00.000Z',
  });

  assert.deepEqual(Object.keys(document), ['version', 'metadata', 'patient', 'parameters', 'statistics', 'validation']);
  assert.equal(document.version, MEDICAL_JSON_VERSION);
  assert.equal(document.metadata.laboratory, 'Example Laboratory');
  assert.equal(document.metadata.pageCount, 1);
  assert.equal(document.metadata.processingTime, pipelineResult.statistics.processingDurationMs);
  assert.deepEqual(document.patient, { name: null, age: null, gender: null });
  assert.equal(document.parameters[0].parameterId, 'hemoglobin');
  assert.deepEqual(document.statistics, pipelineResult.statistics);
  assert.equal(document.validation.valid, true);
  assert.equal(document.validation.warnings[0].code, 'PARTIAL_EXTRACTION');
});

test('marks pipeline failures as canonical validation errors', async () => {
  const [
    { default: medicalPipeline },
    { formatMedicalJson },
  ] = await Promise.all([
    import('../../medical/pipeline/medicalPipeline.js'),
    import('../../medical/formatter/medicalJsonFormatter.js'),
  ]);
  const document = formatMedicalJson(await medicalPipeline.process({ rawText: '' }));

  assert.equal(document.validation.valid, false);
  assert.equal(document.validation.errors[0].code, 'EMPTY_OCR');
});
