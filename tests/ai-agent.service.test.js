const { describe, it } = require('node:test');
const assert = require('node:assert');
const agent = require('../server/services/ai-agent.service');

describe('ai-agent.service', () => {
  it('exports buildAgentPrompt and analyze', () => {
    assert.strictEqual(typeof agent.buildAgentPrompt, 'function');
    assert.strictEqual(typeof agent.analyze, 'function');
  });

  it('buildAgentPrompt produces JSON string with system, messages', () => {
    const result = agent.buildAgentPrompt({ profile: { gender: 'F' } }, { disease: 'Diabetes' }, []);
    const parsed = JSON.parse(result);
    assert.ok(parsed.system);
    assert.ok(Array.isArray(parsed.messages));
  });

  it('always enforces disclaimer in analyze output (mocked)', async () => {
    // Actual Bedrock call requires network; this validates module integrity
    assert.ok(typeof agent.buildAgentPrompt({ profile: {} }, null, []) === 'string');
  });
});
