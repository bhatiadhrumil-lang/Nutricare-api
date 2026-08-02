const assert = require('node:assert/strict');
const test = require('node:test');
const { fixture, expected, generateMetrics } = require('./helpers');

test('extracts raw CBC, liver, kidney, hormone, urine, and tumor-marker references', async (t) => {
  const { parseReferenceRange } = await import('../../medical/reference/referenceParser.js');
  const references = fixture('references.json');
  const outcomes = expected('references.json');
  let correct = 0;

  references.forEach((reference, index) => {
    const actual = parseReferenceRange(reference.raw);
    assert.deepEqual(actual, outcomes[index], reference.id);
    correct += 1;
  });

  const metrics = generateMetrics({
    reportsProcessed: 0, parametersFound: 0, aliasCorrect: 0, aliasTotal: 0,
    valueCorrect: 0, valueTotal: 0, referenceCorrect: correct, referenceTotal: references.length, confidences: [], durations: [],
  });
  t.diagnostic(`medical metrics ${JSON.stringify(metrics)}`);
  assert.equal(metrics.referenceAccuracy, 1);
});
