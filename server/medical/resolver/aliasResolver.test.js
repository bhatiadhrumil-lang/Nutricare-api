import assert from 'node:assert/strict';
import test from 'node:test';
import { aliasResolver } from './aliasResolver.js';

test('resolves Hemoglobin aliases to the canonical parameter', () => {
  for (const alias of ['Hb', 'HGB', 'Haemoglobin', 'Hemoglobin']) {
    assert.equal(aliasResolver(alias)?.id, 'hemoglobin');
  }
});

test('resolves common laboratory aliases', () => {
  assert.equal(aliasResolver('SGPT')?.id, 'alanine_aminotransferase');
  assert.equal(aliasResolver('Vit D')?.id, 'vitamin_d_25_hydroxy');
});

test('normalizes OCR punctuation and whitespace', () => {
  assert.equal(aliasResolver('  Hb\t ')?.id, 'hemoglobin');
  assert.equal(aliasResolver('Gamma—Glutamyl   Transferase')?.id, 'gamma_glutamyl_transferase');
});

test('uses fuzzy matching for OCR substitutions after exact strategies', () => {
  assert.equal(aliasResolver('Hemoglobln', { fuzzyThreshold: 0.9 })?.id, 'hemoglobin');
  assert.equal(aliasResolver('Vltamin D', { fuzzyThreshold: 0.9 })?.id, 'vitamin_d_25_hydroxy');
});

test('returns null for an unknown parameter', () => {
  assert.equal(aliasResolver('Unknown Parameter'), null);
});
