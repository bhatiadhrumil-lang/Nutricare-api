import assert from 'node:assert/strict';
import test from 'node:test';
import { extractMedicalParameters } from './extractor.js';

test('extracts catalog-backed parameters with values, units, and raw ranges', () => {
  const result = extractMedicalParameters([
    'Hb : 12.5 g/dL 13.0 - 17.0',
    'WBC 12,000 10^3/µL 4,000 - 11,000',
    'ALT >200 U/L Reference Range: 0 - 40',
    'Hematocrit 5% 36 - 46',
    'TSH 0.45 mIU/L 0.4 - 4.0',
    'Ferritin <10 ng/mL 15 - 150',
    'Creatinine   1.2   mg/dL   0.6 - 1.3',
  ].join('\n'));

  assert.deepEqual(result.parameters.map((parameter) => parameter.parameterId), [
    'hemoglobin', 'white_blood_cell_count', 'alanine_aminotransferase',
    'hematocrit', 'thyroid_stimulating_hormone', 'ferritin', 'creatinine',
  ]);
  assert.equal(result.parameters[1].value, 12000);
  assert.equal(result.parameters[2].comparator, '>');
  assert.equal(result.parameters[3].valueRaw, '5');
  assert.equal(result.parameters[5].comparator, '<');
  assert.equal(result.parameters[0].referenceRange, '13.0 - 17.0');
});

test('handles mixed case and OCR punctuation without clinical classification', () => {
  const result = extractMedicalParameters('  hGb | 12.0 g/dL\nunknown marker: 4.2 mg/L');
  assert.equal(result.parameters[0].parameterId, 'hemoglobin');
  assert.equal('classification' in result.parameters[0], false);
  assert.equal('interpretation' in result.parameters[0], false);
  assert.equal(result.unmatched[0].reason, 'parameter_not_found');
});

test('handles a large report line by line', () => {
  const report = Array.from({ length: 1000 }, () => 'ALT 42 U/L 0 - 40').join('\n');
  const result = extractMedicalParameters(report);
  assert.equal(result.parameters.length, 1000);
  assert.equal(result.statistics.totalLines, 1000);
  assert.equal(result.statistics.unmatchedLines, 0);
});

test('rejoins table rows split across lines (label, value, range on separate lines)', () => {
  const result = extractMedicalParameters([
    'Hemoglobin',
    '13.2 g/dL',
    '12.0 - 15.0',
    'WBC',
    '12,000 10^3/µL 4,000 - 11,000',
  ].join('\n'));

  assert.deepEqual(result.parameters.map((parameter) => parameter.parameterId), [
    'hemoglobin', 'white_blood_cell_count',
  ]);
  assert.equal(result.parameters[0].value, 13.2);
  assert.equal(result.parameters[0].referenceRange, '12.0 - 15.0');
  assert.equal(result.parameters[1].value, 12000);
  assert.equal(result.unmatched.length, 0);
});

test('attaches a trailing bare-range line to a reference-less parameter', () => {
  const result = extractMedicalParameters('Hemoglobin 13.2 g/dL\n12.0 - 15.0');
  assert.equal(result.parameters[0].parameterId, 'hemoglobin');
  assert.equal(result.parameters[0].referenceRange, '12.0 - 15.0');
  assert.equal(result.unmatched.length, 0);
});

test('does not merge consecutive label-only lines with each other', () => {
  const result = extractMedicalParameters('Hemoglobin\nWBC\n12,000 10^3/µL 4,000 - 11,000');
  assert.equal(result.parameters.length, 1);
  assert.equal(result.parameters[0].parameterId, 'white_blood_cell_count');
  assert.equal(result.unmatched.length, 1);
  assert.equal(result.unmatched[0].line, 'Hemoglobin');
});
