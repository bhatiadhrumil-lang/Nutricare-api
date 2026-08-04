import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateMedicalStatus } from './statusCalculator.js';

const range = { type: 'range', low: 13, high: 17, inclusiveLow: true, inclusiveHigh: true, unit: 'g/dL', warnings: [] };

test('calculates low, normal, high, and exact range boundaries', () => {
  const low = calculateMedicalStatus({ parameter: 'Hemoglobin', normalizedValue: 11.8, reference: range });
  assert.deepEqual({ status: low.status, withinReference: low.withinReference, deviation: low.deviation, deviationPercent: Number(low.deviationPercent.toFixed(2)), distanceFromBoundary: low.distanceFromBoundary }, { status: 'LOW', withinReference: false, deviation: 1.1999999999999993, deviationPercent: 9.23, distanceFromBoundary: 1.1999999999999993 });
  assert.equal(calculateMedicalStatus({ normalizedValue: 15, reference: range }).status, 'NORMAL');
  assert.equal(calculateMedicalStatus({ normalizedValue: 18, reference: range }).status, 'HIGH');
  assert.equal(calculateMedicalStatus({ normalizedValue: 13, reference: range }).withinReference, true);
  assert.equal(calculateMedicalStatus({ normalizedValue: 17, reference: range }).withinReference, true);
});

test('supports upper, lower, and inclusive boundaries', () => {
  assert.equal(calculateMedicalStatus({ normalizedValue: 40, reference: { type: 'upper-limit', high: 40, inclusiveHigh: false } }).status, 'HIGH');
  assert.equal(calculateMedicalStatus({ normalizedValue: 40, reference: { type: 'upper-limit', high: 40, inclusiveHigh: true } }).status, 'NORMAL');
  assert.equal(calculateMedicalStatus({ normalizedValue: 20, reference: { type: 'lower-limit', low: 20, inclusiveLow: false } }).status, 'LOW');
  assert.equal(calculateMedicalStatus({ normalizedValue: 20, reference: { type: 'lower-limit', low: 20, inclusiveLow: true } }).status, 'NORMAL');
});

test('uses explicit critical boundaries only when supplied', () => {
  assert.equal(calculateMedicalStatus({ normalizedValue: 7, reference: { ...range, criticalLow: 8 } }).status, 'CRITICAL_LOW');
  assert.equal(calculateMedicalStatus({ normalizedValue: 21, reference: { ...range, criticalHigh: 20 } }).status, 'CRITICAL_HIGH');
});

test('compares qualitative references without unsafe high-low classification', () => {
  assert.equal(calculateMedicalStatus({ normalizedValue: 'negative', reference: { type: 'qualitative', value: 'negative' } }).status, 'NORMAL');
  assert.equal(calculateMedicalStatus({ normalizedValue: 'positive', reference: { type: 'qualitative', value: 'negative' } }).status, 'UNKNOWN');
});

test('warns for missing, malformed, unknown references and invalid values', () => {
  assert.equal(calculateMedicalStatus({ normalizedValue: 1 }).warnings[0].code, 'MISSING_REFERENCE');
  assert.equal(calculateMedicalStatus({ normalizedValue: 1, reference: { type: 'invalid' } }).warnings[0].code, 'MALFORMED_REFERENCE');
  assert.equal(calculateMedicalStatus({ normalizedValue: 1, reference: { type: 'range', low: 2, high: 1 } }).warnings[0].code, 'MALFORMED_REFERENCE');
  assert.equal(calculateMedicalStatus({ normalizedValue: 1, reference: { type: 'unknown' } }).warnings[0].code, 'UNKNOWN_REFERENCE');
  assert.equal(calculateMedicalStatus({ normalizedValue: null, reference: range }).warnings[0].code, 'MISSING_VALUE');
  assert.equal(calculateMedicalStatus({ normalizedValue: '11', reference: range }).warnings[0].code, 'INVALID_NUMERIC_VALUE');
});
