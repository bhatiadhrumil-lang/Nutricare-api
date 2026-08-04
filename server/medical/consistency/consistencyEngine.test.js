import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateConsistency } from './consistencyEngine.js';

test('detects Iron deficiency biomarker pattern without diagnosing disease', () => {
  const result = evaluateConsistency([
    { id: 'ferritin', value: 8, status: 'LOW', severity: 'SEVERE_LOW' },
    { id: 'serum_iron', value: 5, status: 'LOW', severity: 'MODERATE_LOW' },
  ]);

  const { score, patterns, contradictions, warnings } = result.consistency;
  assert.equal(score, 100);
  assert.equal(patterns.length, 1);
  assert.equal(patterns[0].id, 'iron_depletion_pattern');
  assert.equal(patterns[0].category, 'Iron Studies');
  assert.equal(contradictions.length, 0);
  assert.equal(warnings.length, 0);
});

test('detects Diabetes glycemic elevation pattern', () => {
  const result = evaluateConsistency([
    { id: 'fasting_plasma_glucose', value: 9.5, status: 'HIGH', severity: 'MODERATE_HIGH' },
    { id: 'hemoglobin_a1c', value: 8.5, status: 'HIGH', severity: 'SEVERE_HIGH' },
  ]);

  const { patterns } = result.consistency;
  assert.equal(patterns.length, 1);
  assert.equal(patterns[0].id, 'diabetes_glycemic_pattern');
  assert.equal(patterns[0].category, 'Diabetes');
});

test('detects Liver hepatocellular enzyme pattern', () => {
  const result = evaluateConsistency([
    { id: 'alanine_aminotransferase', value: 120, status: 'HIGH', severity: 'SEVERE_HIGH' },
    { id: 'aspartate_aminotransferase', value: 110, status: 'HIGH', severity: 'SEVERE_HIGH' },
  ]);

  const { patterns } = result.consistency;
  assert.equal(patterns.length, 1);
  assert.equal(patterns[0].id, 'liver_hepatocellular_pattern');
});

test('detects Kidney creatinine and eGFR contradiction', () => {
  const result = evaluateConsistency([
    { id: 'creatinine', value: 250, status: 'HIGH', severity: 'CRITICAL_HIGH' },
    { id: 'estimated_glomerular_filtration_rate', value: 120, status: 'HIGH', severity: 'MODERATE_HIGH' },
  ]);

  const { score, contradictions } = result.consistency;
  assert.equal(contradictions.length, 1);
  assert.equal(contradictions[0].id, 'kidney_creatinine_egfr_discordance');
  assert.equal(contradictions[0].category, 'Kidney');
  assert.equal(score < 100, true);
});

test('detects CBC hemoglobin and hematocrit contradiction', () => {
  const result = evaluateConsistency([
    { id: 'hemoglobin', value: 70, status: 'LOW', severity: 'SEVERE_LOW' },
    { id: 'hematocrit', value: 55, status: 'HIGH', severity: 'CRITICAL_HIGH' },
  ]);

  const { contradictions } = result.consistency;
  assert.equal(contradictions.length, 1);
  assert.equal(contradictions[0].id, 'cbc_hb_hct_discordance');
});

test('handles unknown biomarkers and missing parameters gracefully', () => {
  // Empty input
  const emptyRes = evaluateConsistency([]);
  assert.equal(emptyRes.consistency.warnings[0].code, 'MISSING_PARAMETERS');

  // Unknown biomarker
  const unknownRes = evaluateConsistency([
    { id: 'unknown_biomarker_123', status: 'HIGH' },
  ]);
  assert.equal(unknownRes.consistency.warnings[0].code, 'UNKNOWN_PARAMETER');
});

test('handles boundary cases where no pattern or contradiction is triggered', () => {
  const result = evaluateConsistency([
    { id: 'hemoglobin', value: 140, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'creatinine', value: 80, status: 'NORMAL', severity: 'NORMAL' },
  ]);

  const { score, patterns, contradictions, warnings } = result.consistency;
  assert.equal(score, 100);
  assert.equal(patterns.length, 0);
  assert.equal(contradictions.length, 0);
  assert.equal(warnings.length, 0);
});
