import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeUnit } from './unitAliasEngine.js';
import { checkUnitValidity, convertToCanonical, validateParameter } from './unitValidator.js';

test('normalizes common aliases, whitespace, case, Unicode, and separators', () => {
  for (const [input, expected] of [
    ['mg %', 'mg/dL'], ['MG/DL', 'mg/dL'], ['mg_dl', 'mg/dL'], ['mg..dl', 'mg/dL'],
    ['µg/L', 'µg/L'], ['ug/L', 'µg/L'], ['mcg/L', 'µg/L'], ['μg/L', 'µg/L'],
    ['UMOL/L', 'µmol/L'], ['mMol/L', 'mmol/L'], ['mmol', 'mmol/L'],
    ['mg  /\t dL', 'mg/dL'],
  ]) assert.equal(normalizeUnit(input).normalizedUnit, expected, input);
  assert.equal(normalizeUnit('mg/dL').normalizationType, 'exact');
  assert.equal(normalizeUnit('mg %').normalizationType, 'alias');
});

test('normalizes count scientific notation variants', () => {
  for (const input of ['x10^3/uL', 'X10^3/uL', '10E3/uL', '10*3/uL', '10³/µL']) {
    assert.equal(normalizeUnit(input).normalizedUnit, '10^3/µL', input);
  }
  for (const input of ['x10^6/uL', '10E6/uL']) assert.equal(normalizeUnit(input).normalizedUnit, '10^6/µL', input);
  for (const input of ['×10^9/L', '10E9/L']) assert.equal(normalizeUnit(input).normalizedUnit, '10^9/L', input);
});

test('repairs constrained OCR unit errors with lower confidence', () => {
  for (const [input, expected] of [['mg/d1', 'mg/dL'], ['mmoI/L', 'mmol/L'], ['u/L', 'U/L'], ['µmoI/L', 'µmol/L'], ['pg/mI', 'pg/mL'], ['ng/mI', 'ng/mL'], ['mEq/1', 'mEq/L']]) {
    const result = normalizeUnit(input);
    assert.equal(result.normalizedUnit, expected, input);
    assert.equal(result.normalizationType, 'ocr-correction', input);
    assert.equal(result.confidence, 0.88, input);
  }
});

test('keeps invalid and unknown units non-fatal and emits requested warnings', () => {
  assert.equal(normalizeUnit('@@@').normalizationType, 'unknown');
  assert.equal(normalizeUnit('').warnings[0].code, 'INVALID_FORMAT');
  const validation = validateParameter({ id: 'creatinine', value: 1.2, unit: 'mg/d1' });
  assert.equal(validation.isValid, true);
  assert.equal(validation.normalization.normalizedUnit, 'mg/dL');
  assert.equal(validation.warnings[0].code, 'OCR_CORRECTED');
  assert.equal(checkUnitValidity({ id: 'creatinine', value: 1.2, unit: 'watts' }).isValid, false);
});

test('converts only after unit normalization using audited factors', () => {
  const creatinine = convertToCanonical('creatinine', 1, 'MG / DL');
  assert.deepEqual({ value: creatinine.value, unit: creatinine.unit, converted: creatinine.converted }, { value: 88.4, unit: 'µmol/L', converted: true });
  assert.equal(convertToCanonical('estradiol', 1, 'pg/mI').value, 3.671);
  assert.equal(convertToCanonical('ferritin', 20, 'nmol/L').converted, false);
});
