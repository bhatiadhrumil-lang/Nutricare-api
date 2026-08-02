import assert from 'node:assert/strict';
import test from 'node:test';
import medicalPipeline from './medicalPipeline.js';

test('creates a structured medical report in one extraction pass', async () => {
  const report = await medicalPipeline.process({
    rawText: 'Hb 13.0 g/dL 13-17 g/dL\nALT >200 U/L <40 U/L\nUnknown marker: 5',
    sourceType: 'application/pdf',
    fileName: 'report.pdf',
    pageCount: 1,
  });

  assert.equal(report.metadata.fileName, 'report.pdf');
  assert.equal(report.parameters.length, 2);
  assert.deepEqual(report.parameters[0].referenceRange, { raw: '13-17 g/dL', low: '13', high: '17', unit: 'g/dL' });
  assert.deepEqual(report.parameters[1].referenceRange, { raw: '<40 U/L', operator: '<', value: '40', unit: 'U/L' });
  assert.equal(report.statistics.totalOcrLines, 3);
  assert.equal(report.statistics.matchedParameters, 2);
  assert.equal(report.statistics.unmatchedParameters, 1);
  assert.equal(report.statistics.aliasMatches, 2);
  assert.ok(report.metadata.errors.some((error) => error.code === 'PARTIAL_EXTRACTION'));
});

test('reports empty OCR and no detected parameters as structured metadata errors', async () => {
  const empty = await medicalPipeline.process({ rawText: '', sourceType: 'application/pdf' });
  assert.equal(empty.metadata.errors[0].code, 'EMPTY_OCR');

  const unknown = await medicalPipeline.process({ rawText: 'Unreadable document heading' });
  assert.equal(unknown.metadata.errors[0].code, 'NO_PARAMETERS_DETECTED');
  assert.equal(unknown.statistics.matchedParameters, 0);
});

test('counts fuzzy alias matches without re-running extraction', async () => {
  const report = await medicalPipeline.process({ rawText: 'Hemoglobln 12.0 g/dL 13-17' });
  assert.equal(report.parameters[0].parameterId, 'hemoglobin');
  assert.equal(report.statistics.aliasMatches, 1);
  assert.equal(report.statistics.fuzzyMatches, 1);
});
