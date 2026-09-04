const test = require('node:test');
const assert = require('node:assert/strict');
const { __test } = require('./ai.service');

test('parses a signed Bedrock URL from the provided env-style key', () => {
  const signedUrl = 'https://bedrock.amazonaws.com/?Action=CallWithBearerToken&X-Amz-Signature=abc123';
  const encodedKey = 'bedrock-api-key-' + Buffer.from(signedUrl).toString('base64');

  assert.equal(__test.parseSignedBedrockUrl(encodedKey), signedUrl);
});

test('normalizes bedrock host-only values into a full https URL', () => {
  const signedUrl = 'bedrock.amazonaws.com/?Action=CallWithBearerToken&X-Amz-Signature=abc123';
  const encodedKey = 'bedrock-api-key-' + Buffer.from(signedUrl).toString('base64');

  assert.equal(__test.parseSignedBedrockUrl(encodedKey), 'https://' + signedUrl);
});

test('builds an Anthropic payload with system prompts separated from messages', () => {
  const payload = __test.buildAnthropicPayload(
    [
      { role: 'system', content: 'You are a helpful nutrition guide.' },
      { role: 'user', content: 'Give me a summary.' },
    ],
    512,
    0.4
  );

  assert.equal(payload.system, 'You are a helpful nutrition guide.');
  assert.deepEqual(payload.messages, [{ role: 'user', content: 'Give me a summary.' }]);
});

test('fallback preserves normalized values when Bedrock is unavailable', () => {
  const result = __test.buildFallbackAnalysis({
    parameters: [
      { parameter: 'Fasting Glucose', normalizedValue: 118, normalizedUnit: 'mg/dL', status: 'HIGH' },
      { parameter: 'LDL Cholesterol', normalizedValue: 142, normalizedUnit: 'mg/dL', status: 'HIGH' },
    ],
  });

  assert.equal(result.bloodParameters.length, 2);
  assert.deepEqual(result.bloodParameters[0], {
    name: 'Fasting Glucose',
    value: '118 mg/dL',
    status: 'high',
    explanation: 'This Fasting Glucose result is marked high and should be reviewed with a clinician.',
  });
  assert.equal(result.disease, 'Lipid profile review');
});
