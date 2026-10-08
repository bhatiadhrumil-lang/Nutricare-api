import assert from 'node:assert/strict';
import test from 'node:test';
import { convertToCanonical } from './unitValidator.js';

// C-2: conversion math must produce canonical value + canonical unit pairs.
// 13.2 g/dL -> 132 g/L (never 132 g/dL).
test('converts hemoglobin g/dL to canonical g/L as a consistent pair', () => {
  const result = convertToCanonical('hemoglobin', 13.2, 'g/dL');
  assert.equal(result.converted, true);
  assert.equal(result.value, 132);
  assert.equal(result.unit, 'g/L');
});

// 110 mg/dL -> ~6.105 mmol/L (never 6.105 mg/dL).
test('converts glucose mg/dL to canonical mmol/L as a consistent pair', () => {
  const result = convertToCanonical('fasting_plasma_glucose', 110, 'mg/dL');
  assert.equal(result.converted, true);
  assert.ok(Math.abs(result.value - 6.105) < 1e-9);
  assert.equal(result.unit, 'mmol/L');
});

// 0.45 L/L -> 45 % so L/L inputs share the canonical percent basis.
test('converts hematocrit L/L fractions to canonical percent', () => {
  const result = convertToCanonical('hematocrit', 0.45, 'L/L');
  assert.equal(result.converted, true);
  assert.ok(Math.abs(result.value - 45) < 1e-9);
  assert.equal(result.unit, '%');
});

test('leaves already-canonical values untouched', () => {
  const result = convertToCanonical('hemoglobin', 132, 'g/L');
  assert.equal(result.converted, false);
  assert.equal(result.value, 132);
  assert.equal(result.unit, 'g/L');
});

test('passes unconvertible units through with the report unit intact', () => {
  const result = convertToCanonical('hemoglobin', 13.2, 'furlongs');
  assert.equal(result.converted, false);
  assert.equal(result.value, 13.2);
});
