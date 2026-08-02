const assert = require('node:assert/strict');
const test = require('node:test');
const { fixture, expected, generateMetrics } = require('./helpers');

test('medical aliases resolve expected catalog IDs, including OCR noise and unknowns', async (t) => {
  const { aliasResolver } = await import('../../medical/resolver/aliasResolver.js');
  const aliases = fixture('aliases.json');
  const outcomes = expected('aliases.json');
  let correct = 0;

  aliases.forEach((item, index) => {
    const actual = aliasResolver(item.label)?.id ?? null;
    assert.equal(actual, outcomes[index].parameterId, item.label);
    if (actual === outcomes[index].parameterId) correct += 1;
  });

  const metrics = generateMetrics({
    reportsProcessed: 0, parametersFound: 0, aliasCorrect: correct, aliasTotal: aliases.length,
    valueCorrect: 0, valueTotal: 0, referenceCorrect: 0, referenceTotal: 0, confidences: [], durations: [],
  });
  t.diagnostic(`medical metrics ${JSON.stringify(metrics)}`);
  assert.equal(metrics.aliasAccuracy, 1);
});
