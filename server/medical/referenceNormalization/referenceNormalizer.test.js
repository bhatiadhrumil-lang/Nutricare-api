import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeReference } from './referenceNormalizer.js';

test('normalizes numeric ranges and embedded unit aliases', () => {
  for (const raw of ['13-17', '13 – 17', '13 to 17', '13~17']) {
    const result = normalizeReference(raw);
    assert.equal(result.type, 'range');
    assert.equal(result.low, 13);
    assert.equal(result.high, 17);
    assert.equal(result.inclusiveLow, true);
    assert.equal(result.inclusiveHigh, true);
  }
  const unitRange = normalizeReference('0.6 - 1.3 MG / DL');
  assert.equal(unitRange.unit, 'mg/dL');
  assert.equal(unitRange.warnings[0].code, 'UNIT_NORMALIZED');
});

test('normalizes upper, lower, and inclusive limits', () => {
  assert.deepEqual(normalizeReference('<40'), { type: 'upper-limit', low: null, high: 40, unit: null, inclusiveLow: false, inclusiveHigh: false, raw: '<40', warnings: [] });
  assert.equal(normalizeReference('>20').low, 20);
  assert.equal(normalizeReference('≤40').inclusiveHigh, true);
  assert.equal(normalizeReference('>=10').inclusiveLow, true);
});

test('normalizes qualitative and risk references', () => {
  assert.equal(normalizeReference('Non Reactive').value, 'non_reactive');
  assert.equal(normalizeReference('Not Detected').value, 'not_detected');
  assert.equal(normalizeReference('Present').value, 'present');
  const risk = normalizeReference('High Risk');
  assert.equal(risk.type, 'risk-category');
  assert.equal(risk.value, 'high_risk');
});

test('retains demographic qualifiers alongside normalized references', () => {
  assert.deepEqual(normalizeReference('Male: 13 - 17 g/dL').demographic, { gender: 'male' });
  assert.deepEqual(normalizeReference('Child: < 10').demographic, { ageGroup: 'child' });
  assert.deepEqual(normalizeReference('Trimester 2: 10 to 20').demographic, { pregnancyTrimester: 2 });
});

test('warns instead of throwing for malformed, missing, and unknown references', () => {
  assert.equal(normalizeReference('17 - 13').warnings[0].code, 'IMPOSSIBLE_RANGE');
  assert.equal(normalizeReference('13 -').warnings[0].code, 'INVALID_FORMAT');
  assert.equal(normalizeReference(null).warnings[0].code, 'MISSING_REFERENCE');
  assert.equal(normalizeReference('Laboratory standard').warnings[0].code, 'UNKNOWN_REFERENCE');
});
