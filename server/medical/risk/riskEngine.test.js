import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateHealthRisk } from './riskEngine.js';
import { calculateOverallScore } from './overallScoring.js';

test('calculates health scores and risk levels for partial report matching example output schema', () => {
  const result = calculateHealthRisk([
    { id: 'creatinine', value: 80, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'blood_urea_nitrogen', value: 5.0, status: 'NORMAL', severity: 'NORMAL' },
  ]);

  assert.equal(typeof result.healthScore.overall, 'number');
  assert.equal(Array.isArray(result.healthScore.domains), true);
  const kidneyDomain = result.healthScore.domains.find((d) => d.name === 'Kidney');
  assert.notEqual(kidneyDomain, undefined);
  assert.equal(kidneyDomain.name, 'Kidney');
  assert.equal(kidneyDomain.score, 100);
  assert.equal(kidneyDomain.risk, 'VERY_LOW_RISK');
  assert.equal(kidneyDomain.confidence > 0, true);
});

test('classifies risk levels across domains according to severity penalties', () => {
  const result = calculateHealthRisk([
    // Kidney: NORMAL -> 100 score -> VERY_LOW_RISK
    { id: 'creatinine', value: 80, status: 'NORMAL', severity: 'NORMAL' },
    // Liver: SEVERE_HIGH -> score decreases -> HIGH_RISK / MODERATE_RISK
    { id: 'alanine_aminotransferase', value: 200, status: 'HIGH', severity: 'SEVERE_HIGH' },
    // Cardiac: CRITICAL_HIGH -> score decreases heavily -> VERY_HIGH_RISK
    { id: 'troponin_i', value: 1.0, status: 'HIGH', severity: 'CRITICAL_HIGH', critical: true },
  ]);

  const kidney = result.healthScore.domains.find((d) => d.name === 'Kidney');
  const liver = result.healthScore.domains.find((d) => d.name === 'Liver');
  const cardiac = result.healthScore.domains.find((d) => d.name === 'Cardiac');

  assert.equal(kidney.risk, 'VERY_LOW_RISK');
  assert.equal(liver.score < 100, true);
  assert.equal(cardiac.score < 50, true);
  assert.equal(cardiac.risk, 'VERY_HIGH_RISK');
});

test('applies domain weighting instead of simple average for overall health score', () => {
  const domains = [
    { name: 'Cardiac', score: 40 }, // Weight 1.8
    { name: 'Vitamins', score: 100 }, // Weight 0.8
  ];

  const weightedOverall = calculateOverallScore(domains);
  const simpleAverage = Math.round((40 + 100) / 2); // 70

  // (40*1.8 + 100*0.8) / (1.8 + 0.8) = (72 + 80) / 2.6 = 152 / 2.6 = 58.46 -> 58
  assert.equal(weightedOverall, 58);
  assert.notEqual(weightedOverall, simpleAverage);
});

test('handles complete reports covering all 10 medical domains', () => {
  const result = calculateHealthRisk([
    { id: 'hemoglobin', value: 140, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'creatinine', value: 80, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'alanine_aminotransferase', value: 25, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'fasting_plasma_glucose', value: 5.0, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'total_cholesterol', value: 4.5, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'thyroid_stimulating_hormone', value: 2.0, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'sodium', value: 140, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'vitamin_d_25_hydroxy', value: 35, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'high_sensitivity_c_reactive_protein', value: 1.0, status: 'NORMAL', severity: 'NORMAL' },
    { id: 'troponin_i', value: 0.01, status: 'NORMAL', severity: 'NORMAL' },
  ]);

  assert.equal(result.healthScore.domains.length, 10);
  assert.equal(result.healthScore.overall, 100);
});

test('emits warnings for unknown parameters and missing input', () => {
  const emptyRes = calculateHealthRisk([]);
  assert.equal(emptyRes.warnings[0].code, 'MISSING_INPUT');

  const unknownRes = calculateHealthRisk([
    { id: 'unknown_biomarker_xyz', status: 'NORMAL' },
  ]);
  assert.equal(unknownRes.warnings.some((w) => w.code === 'UNKNOWN_PARAMETER'), true);
});
