/**
 * ai.service.test.js — Bedrock model migration tests (Claude Sonnet 4.6).
 *
 * All Bedrock callers are stubbed: no test here touches the network.
 * Live verification is done separately against the real Bedrock endpoint.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeReport, __test } = require('../services/ai.service');

function withEnv(name, value, fn) {
  const had = Object.prototype.hasOwnProperty.call(process.env, name);
  const saved = process.env[name];
  try {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
    return fn();
  } finally {
    if (had) process.env[name] = saved;
    else delete process.env[name];
  }
}

const okCaller = (reply) => async () => reply;
const failingCaller = (error) => async () => { throw error; };
const sdkError = (name, message, status) => {
  const error = new Error(message);
  error.name = name;
  if (status !== undefined) error.$metadata = { httpStatusCode: status };
  return error;
};

const SAMPLE_AI_CONTEXT = {
  parameters: [
    { name: 'Hemoglobin', normalizedValue: 13.2, normalizedUnit: 'g/dL', status: 'normal' },
  ],
};

// 1. Correct model ID is selected.
test('selects Claude Sonnet 4.6 by default', () => {
  withEnv('BEDROCK_MODEL_ID', undefined, () => {
    assert.equal(__test.resolveModelId(), 'anthropic.claude-sonnet-4-6');
    assert.equal(__test.DEFAULT_BEDROCK_MODEL_ID, 'anthropic.claude-sonnet-4-6');
  });
});

// 2. BEDROCK_MODEL_ID environment override works.
test('BEDROCK_MODEL_ID override wins; blank falls back to default', () => {
  withEnv('BEDROCK_MODEL_ID', 'custom-model-id', () => {
    assert.equal(__test.resolveModelId(), 'custom-model-id');
  });
  withEnv('BEDROCK_MODEL_ID', '   ', () => {
    assert.equal(__test.resolveModelId(), 'anthropic.claude-sonnet-4-6');
  });
});

// 3. temperature is sent correctly.
test('temperature 0.2 is the configured sampling value and reaches Bedrock', async () => {
  assert.equal(__test.BEDROCK_TEMPERATURE, 0.2);
  const payload = __test.buildAnthropicPayload([{ role: 'user', content: 'hi' }]);
  assert.equal(payload.temperature, 0.2);

  let seen;
  const capture = async (client, messages, maxTokens, temperature) => {
    seen = { maxTokens, temperature };
    return JSON.stringify({ disease: 'X', summary: 'Y', bloodParameters: [] });
  };
  await analyzeReport('context', null, { caller: capture, client: {} });
  assert.equal(seen.temperature, 0.2);
});

// 4. top_p is NOT sent together with temperature.
test('Anthropic payload never includes top_p', () => {
  const payload = __test.buildAnthropicPayload(
    [{ role: 'system', content: 'sys' }, { role: 'user', content: 'hi' }],
    512,
    0.2,
  );
  assert.equal('top_p' in payload, false);
});

// 5. 30-second timeout is respected.
test('Bedrock timeout defaults to 30000ms and honors BEDROCK_TIMEOUT_MS', () => {
  withEnv('BEDROCK_TIMEOUT_MS', undefined, () => {
    assert.equal(__test.resolveTimeoutMs(), 30000);
    assert.equal(__test.DEFAULT_BEDROCK_TIMEOUT_MS, 30000);
  });
  withEnv('BEDROCK_TIMEOUT_MS', '45000', () => {
    assert.equal(__test.resolveTimeoutMs(), 45000);
  });
  for (const bad of ['not-a-number', '-5', '0', '']) {
    withEnv('BEDROCK_TIMEOUT_MS', bad, () => {
      assert.equal(__test.resolveTimeoutMs(), 30000);
    });
  }
});

test('withTimeout rejects a hung request with a coded timeout error', async () => {
  const hung = new Promise(() => {});
  await assert.rejects(__test.withTimeout(hung, 20), (error) => {
    assert.equal(error.code, 'BEDROCK_TIMEOUT');
    return true;
  });
  assert.equal(await __test.withTimeout(Promise.resolve('fast'), 1000), 'fast');
});

// 6. Successful Bedrock response is parsed correctly.
test('successful Bedrock JSON is returned marked as a Bedrock success', async () => {
  const reply = JSON.stringify({
    disease: 'Blood sugar review',
    summary: 'Sugar is high.',
    bloodParameters: [{ name: 'HbA1c', value: '7.8 %', status: 'high', explanation: 'High.' }],
  });
  const result = await analyzeReport('ai-context', null, { caller: okCaller(reply), client: {} });
  assert.equal(result.disease, 'Blood sugar review');
  assert.equal(result.success, true);
  assert.equal(result.source, 'bedrock');
  assert.equal(result.model, 'anthropic.claude-sonnet-4-6');
});

// 7. Model-not-found error is handled.
test('unknown and retired model identifiers map to MODEL_NOT_FOUND', async () => {
  for (const error of [
    sdkError('ResourceNotFoundException', 'Could not resolve model anthropic.claude-sonnet-4-6'),
    sdkError('ValidationException', 'This model version has reached the end of its life.'),
  ]) {
    const result = await analyzeReport('ctx', null, { caller: failingCaller(error), client: {} });
    assert.equal(result.errorCode, 'MODEL_NOT_FOUND');
    assert.equal(result.success, false);
    assert.equal(result.source, 'fallback');
  }
  assert.equal(__test.classifyBedrockError(sdkError('ResourceNotFoundException', 'x')), 'MODEL_NOT_FOUND');
});

// 8. Access-denied error is handled.
test('authorization failures map to MODEL_ACCESS_DENIED', async () => {
  const error = sdkError('AccessDeniedException', 'You do not have access to this model', 403);
  assert.equal(__test.classifyBedrockError(error), 'MODEL_ACCESS_DENIED');
  const result = await analyzeReport('ctx', null, { caller: failingCaller(error), client: {} });
  assert.equal(result.errorCode, 'MODEL_ACCESS_DENIED');
  assert.equal(result.success, false);
});

// 9. Timeout is handled.
test('hung Bedrock calls map to BEDROCK_TIMEOUT', () => {
  const error = new Error('Bedrock request timed out after 30000ms');
  error.code = 'BEDROCK_TIMEOUT';
  assert.equal(__test.classifyBedrockError(error), 'BEDROCK_TIMEOUT');
  assert.equal(__test.classifyBedrockError(sdkError('ModelTimeoutException', 'Model timed out')), 'BEDROCK_TIMEOUT');
});

// 10. Throttling is handled.
test('throttling maps to BEDROCK_THROTTLED', async () => {
  const error = sdkError('ThrottlingException', 'Rate exceeded for model', 429);
  assert.equal(__test.classifyBedrockError(error), 'BEDROCK_THROTTLED');
  const result = await analyzeReport('ctx', null, { caller: failingCaller(error), client: {} });
  assert.equal(result.errorCode, 'BEDROCK_THROTTLED');
});

// 11. Bedrock validation errors are handled.
test('generic validation failures map to BEDROCK_VALIDATION_ERROR', () => {
  const error = sdkError('ValidationException', 'The provided input failed validation', 400);
  assert.equal(__test.classifyBedrockError(error), 'BEDROCK_VALIDATION_ERROR');
  assert.equal(__test.classifyBedrockError(sdkError('InternalServerException', 'boom', 500)), 'BEDROCK_SERVICE_ERROR');
  assert.equal(__test.classifyBedrockError(new Error('weird')), 'UNKNOWN_AI_ERROR');
});

// 12. Fallback is clearly marked as fallback.
test('fallback carries success:false, source and errorCode, and keeps clinical data', async () => {
  const error = sdkError('ServiceUnavailableException', 'down', 503);
  const result = await analyzeReport('ctx', SAMPLE_AI_CONTEXT, { caller: failingCaller(error), client: {} });
  assert.equal(result.success, false);
  assert.equal(result.source, 'fallback');
  assert.equal(result.errorCode, 'BEDROCK_SERVICE_ERROR');
  assert.equal(typeof result.notice, 'string');
  assert.ok(result.notice.length > 0);
  assert.equal(result.bloodParameters[0].name, 'Hemoglobin');
});

// 13. AI Context Builder output reaches the AI service unchanged.
test('formatted AI context is embedded verbatim in the Bedrock prompt', async () => {
  const formattedContext = '=== NUTRIHEALTH MEDICAL REPORT AI CONTEXT ===\nHealth Score: 72/100 (Fair)';
  let captured;
  const capture = async (client, messages) => {
    captured = messages;
    return JSON.stringify({ disease: 'X', summary: 'Y', bloodParameters: [] });
  };
  await analyzeReport(formattedContext, SAMPLE_AI_CONTEXT, { caller: capture, client: {} });
  assert.equal(captured.length, 1);
  assert.equal(captured[0].role, 'user');
  assert.ok(captured[0].content.includes(formattedContext));
});

// C-2 (item 11): fallback follows the canonical value/unit contract.
// Enriched input pairs canonical values with canonical units, so fallback
// output must render 132 g/L (never 132 g/dL) and 6.105 mmol/L (never
// 6.105 mg/dL).
test('C-2 fallback renders canonical pairs from enriched parameters', () => {
  const enriched = {
    parameters: [
      { name: 'hemoglobin', value: 13.2, unit: 'g/dL', normalizedValue: 132, normalizedUnit: 'g/L', status: 'high' },
      { name: 'fasting_plasma_glucose', value: 110, unit: 'mg/dL', normalizedValue: 6.105, normalizedUnit: 'mmol/L', status: 'high' },
    ],
  };
  const result = __test.buildFallbackAnalysis(enriched);
  const byName = Object.fromEntries(result.bloodParameters.map((p) => [p.name, p.value]));
  assert.equal(byName.hemoglobin, '132 g/L');
  assert.equal(byName.fasting_plasma_glucose, '6.105 mmol/L');
  for (const p of result.bloodParameters) {
    assert.ok(!String(p.value).includes('132 g/dL'), `wrong pair in ${p.name}`);
    assert.ok(!String(p.value).includes('6.105 mg/dL'), `wrong pair in ${p.name}`);
  }
});
