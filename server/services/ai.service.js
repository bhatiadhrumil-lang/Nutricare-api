const fs = require('fs');
const { buildAnalysisPrompt, buildChatSystemPrompt } = require('../utils/promptBuilder');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
const MAX_TOKENS = 2048;
const TEMPARATURE = 0.2;

function parseSignedBedrockUrl(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return null;

  const candidate = apiKey.trim();
  if (!candidate) return null;

  const normalized = candidate.startsWith('bedrock-api-key-') ? candidate.replace('bedrock-api-key-', '') : candidate;

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  try {
    const decoded = Buffer.from(normalized, 'base64').toString('utf-8');
    if (/^https?:\/\//i.test(decoded)) {
      return decoded;
    }

    if (/^bedrock(?:\.[a-z0-9-]+)+/i.test(decoded)) {
      return `https://${decoded}`;
    }

    const urlMatch = decoded.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      return urlMatch[0];
    }
  } catch (e) {
    return null;
  }

  return null;
}

function parseBedrockKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('bedrock-api-key-')) {
    return null;
  }
  const b64 = apiKey.replace('bedrock-api-key-', '');
  try {
    const decoded = Buffer.from(b64, 'base64').toString('utf-8');
    const credMatch = decoded.match(/X-Amz-Credential=(.+?)(?:&|$)/);
    const regionMatch = decoded.match(/X-Amz-Date=(\d{4})(\d{2})(\d{2})\/([a-z0-9-]+)/);
    const accessKeyMatch = decoded.match(/X-Amz-Credential=(ASIA[A-Z0-9]+)/);

    if (!accessKeyMatch || !regionMatch) return null;

    const accessKeyId = accessKeyMatch[1];
    const region = regionMatch[4];

    let secretKey = null;
    let sessionToken = null;

    const secretKeyMatch = decoded.match(/[a-zA-Z0-9/+=]{40,}/g);
    if (secretKeyMatch && secretKeyMatch.length > 1) {
      secretKey = secretKeyMatch[1];
    }

    return { accessKeyId, secretKey, sessionToken, region, decoded };
  } catch (e) {
    return null;
  }
}

function buildAnthropicPayload(messages, maxTokens = MAX_TOKENS, temperature = TEMPARATURE) {
  const systemMessages = [];
  const chatMessages = [];

  for (const message of messages || []) {
    if (!message || typeof message.content !== 'string') continue;

    if (message.role === 'system') {
      systemMessages.push(message.content);
    } else if (message.role === 'assistant' || message.role === 'user') {
      chatMessages.push({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      });
    }
  }

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    temperature,
    messages: chatMessages,
  };

  if (systemMessages.length > 0) {
    payload.system = systemMessages.join('\n');
  }

  return payload;
}

function extractReportHighlights(text) {
  const lines = (text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const findings = [];

  const addFinding = (label, match) => {
    if (!match) return;
    const value = match[1] ? `${match[1]} ${match[2] || ''}`.trim() : null;
    if (value) findings.push({ label, value });
  };

  lines.forEach((line) => {
    const lower = line.toLowerCase();

    if (/hemoglobin|hb/i.test(lower)) {
      const match = line.match(/([0-9.]+)\s*([a-zA-Z/µ°]+)?/);
      addFinding('Hemoglobin', match);
    }

    if (/fasting glucose|glucose|blood sugar/i.test(lower)) {
      const match = line.match(/([0-9.]+)\s*([a-zA-Z/µ°]+)?/);
      addFinding('Fasting Glucose', match);
    }

    if (/ldl/i.test(lower)) {
      const match = line.match(/([0-9.]+)\s*([a-zA-Z/µ°]+)?/);
      addFinding('LDL Cholesterol', match);
    } else if (/hdl|cholesterol|triglycerides/i.test(lower)) {
      const match = line.match(/([0-9.]+)\s*([a-zA-Z/µ°]+)?/);
      addFinding('Cholesterol', match);
    }

    if (/vitamin d|vitamin b|vitamin/i.test(lower)) {
      const match = line.match(/([0-9.]+)\s*([a-zA-Z/µ°]+)?/);
      addFinding('Vitamin', match);
    }
  });

  return findings;
}

function buildFallbackAnalysis(extractionResult) {
  const source = extractionResult && typeof extractionResult === 'object' ? extractionResult : null;
  const text = typeof extractionResult === 'string' ? extractionResult : JSON.stringify(extractionResult || {});
  const lower = (text || '').toLowerCase();
  const highlights = extractReportHighlights(text);

  // The normal fallback input from the report controller is the compact AI
  // context, not raw OCR text. Read its parameter arrays explicitly instead
  // of searching the JSON string; otherwise a Bedrock outage degrades every
  // report to the misleading generic "Report values" card.
  const structuredParameters = source
    ? [
      ...(Array.isArray(source.parameters) ? source.parameters : []),
      ...(Array.isArray(source.criticalFindings) ? source.criticalFindings : []),
      ...(Array.isArray(source.abnormalParameters) ? source.abnormalParameters : []),
    ]
    : [];

  const seenParameters = new Set();
  const contextParameters = structuredParameters.reduce((result, item) => {
    if (!item || typeof item !== 'object') return result;

    const name = item.name || item.parameter || item.id;
    const rawValue = item.normalizedValue ?? item.value;
    if (!name || rawValue === undefined || rawValue === null) return result;

    const key = String(name).toLowerCase();
    if (seenParameters.has(key)) return result;
    seenParameters.add(key);

    const unit = item.normalizedUnit ?? item.unit;
    const value = unit && !String(rawValue).includes(unit)
      ? `${rawValue} ${unit}`
      : String(rawValue);
    const status = String(item.status || 'review').toLowerCase();
    result.push({
      name: String(name),
      value,
      status,
      explanation: item.explanation || `This ${name} result is marked ${status.replace(/_/g, ' ')} and should be reviewed with a clinician.`,
    });
    return result;
  }, []);

  const detectParameter = (patterns) => patterns.some((pattern) => lower.includes(pattern));

  let disease = 'General wellness review';
  const summaryParts = [];

  const parameterNames = contextParameters.map((item) => item.name.toLowerCase());
  const hasParameter = (patterns) => patterns.some((pattern) => parameterNames.some((name) => name.includes(pattern)));

  if (detectParameter(['glucose', 'fasting sugar', 'blood sugar']) || hasParameter(['glucose', 'sugar'])) {
    disease = 'Blood sugar review';
    summaryParts.push('blood sugar values');
  }
  if (detectParameter(['cholesterol', 'ldl', 'hdl', 'triglycerides']) || hasParameter(['cholesterol', 'ldl', 'hdl', 'triglyceride'])) {
    disease = 'Lipid profile review';
    summaryParts.push('cholesterol and lipid markers');
  }
  if (detectParameter(['hemoglobin', 'anemia', 'hb']) || hasParameter(['hemoglobin', 'haemoglobin'])) {
    disease = 'Hemoglobin review';
    summaryParts.push('hemoglobin and iron-related markers');
  }
  if (detectParameter(['vitamin d', 'vitamin b', 'vitamin']) || hasParameter(['vitamin'])) {
    summaryParts.push('vitamin and micronutrient levels');
  }

  const sentenceParts = (contextParameters.length > 0 ? contextParameters : highlights)
    .slice(0, 3)
    .map((item) => `${item.name || item.label} ${item.value}`);
  const reportMention = sentenceParts.length > 0 ? `The report includes ${sentenceParts.join(', ')}.` : 'The report includes several lab values that should be reviewed.';
  const focusText = summaryParts.length > 0 ? `The main focus appears to be ${disease.toLowerCase()} and ${summaryParts.join(' and ')}.` : 'The main focus appears to be the uploaded report values.';
  const summary = `${reportMention} ${focusText} Please confirm these findings with a qualified healthcare professional.`;

  const bloodParameters = [...contextParameters];
  if (bloodParameters.length === 0 && highlights.length > 0) {
    highlights.slice(0, 4).forEach((item) => {
      bloodParameters.push({
        name: item.label,
        value: item.value,
        status: 'review',
        explanation: `This marker from your report should be reviewed with a clinician to understand its significance.`,
      });
    });
  }

  if (bloodParameters.length === 0) {
    bloodParameters.push({ name: 'Report values', value: 'Reviewed from uploaded report', status: 'review', explanation: 'The uploaded report contains lab values that should be reviewed with a clinician.' });
  }

  return {
    disease,
    summary,
    confidence: 'Medium',
    disclaimer: 'This is not medical advice. Please consult a qualified healthcare professional.',
    bloodParameters,
    nutrients: ['Protein', 'Fiber', 'Hydration', 'Iron'],
    foodsToEat: ['Leafy greens', 'Whole grains', 'Lean protein', 'Colorful vegetables'],
    foodsToAvoid: ['Processed snacks', 'Excess sugar', 'Highly fried foods', 'Sugary beverages'],
    lifestyle: ['Regular sleep schedule', 'Daily movement', 'Hydration', 'Stress reduction'],
  };
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms)),
  ]);
}

function createBedrockClient(apiKey) {
  const signedUrl = parseSignedBedrockUrl(apiKey);
  if (signedUrl) {
    return { mode: 'signed-url', signedUrl };
  }

  const creds = parseBedrockKey(apiKey);
  const region = creds?.region || process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-2';

  const clientConfig = { region };

  // Prefer creds embedded in the bedrock-api-key blob, then fall back to
  // standard AWS IAM env vars (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY),
  // which is the normal Bedrock auth path (access key + secret access key).
  const accessKeyId = creds?.accessKeyId || process.env.AWS_ACCESS_KEY_ID || '';
  const secretAccessKey = creds?.secretKey || process.env.AWS_SECRET_ACCESS_KEY || '';
  const sessionToken = creds?.sessionToken || process.env.AWS_SESSION_TOKEN || undefined;

  if (accessKeyId && secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    };
  }
  // If neither source has real credentials, `credentials` is omitted so the
  // AWS SDK falls back to its default chain (~/.aws/credentials, EC2 IMDS…).

  return { mode: 'sdk', client: new BedrockRuntimeClient(clientConfig) };
}

async function callBedrock(client, prompt, maxTokens = MAX_TOKENS, temperature = TEMPARATURE) {
  return withTimeout(callBedrockWithMessages(client, [{ role: 'user', content: prompt }], maxTokens, temperature), 3000);
}

async function callBedrockWithMessages(client, messages, maxTokens = MAX_TOKENS, temperature = TEMPARATURE) {
  if (client?.mode === 'signed-url') {
    try {
      const response = await fetch(client.signedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(buildAnthropicPayload(messages, maxTokens, temperature)),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Bedrock request failed (${response.status}): ${responseText}`);
      }

      const body = JSON.parse(responseText);
      return body.content?.[0]?.text || '';
    } catch (error) {
      console.error('[Bedrock] Signed URL request failed:', error.message);
      throw new Error(`Bedrock request failed: ${error.message}`);
    }
  }

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(buildAnthropicPayload(messages, maxTokens, temperature)),
  });

  const response = await client.client.send(command);
  const body = JSON.parse(Buffer.from(response.body).toString('utf-8'));
  return body.content?.[0]?.text || '';
}

/**
 * Analyzes a medical report using Claude (AWS Bedrock).
 *
 * When called from the report controller, `extractionResult` is the
 * pre-formatted AI context string produced by formatContextForClaude().
 * Claude NEVER receives raw OCR text — only the structured AI context.
 *
 * @param {string|object} extractionResult - Formatted AI context string OR image reference object
 * @param {object|null}   aiContext        - Structured AI context object (for fallback enrichment)
 */
async function analyzeReport(extractionResult, aiContext = null) {
  const client = createBedrockClient(process.env.BEDROCK_API_KEY);
  let prompt;
  let messages;

  if (typeof extractionResult === 'string') {
    // extractionResult is the formatted AI context string from formatContextForClaude()
    // or a legacy plain-text OCR string for backward compatibility.
    // buildAnalysisPrompt wraps it in the structured Claude prompt.
    prompt = buildAnalysisPrompt(extractionResult);
    messages = [{ role: 'user', content: prompt }];
  } else if (extractionResult && extractionResult.isImage) {
    prompt = buildAnalysisPrompt('[Extract all blood test values from the attached image of a blood report. Return structured JSON analysis.]');
    messages = [
      { role: 'user', content: prompt },
    ];
  } else {
    throw new Error('Invalid extractionResult passed to analyzeReport.');
  }

  let rawText;
  try {
    rawText = await callBedrockWithMessages(client, messages, MAX_TOKENS, TEMPARATURE);
  } catch (error) {
    console.warn('[AI] Bedrock request failed, using fallback analysis:', error.message);
    // Pass aiContext to fallback so it can use structured data if available
    return buildFallbackAnalysis(aiContext || extractionResult);
  }

  const cleanedText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (parseErr) {
    console.error('[AI] Failed to parse JSON. Raw response (first 500 chars):', cleanedText.slice(0, 500));
    return buildFallbackAnalysis(aiContext || extractionResult);
  }

  if (!parsed.disclaimer) {
    parsed.disclaimer = 'This is not medical advice. Please consult a qualified healthcare professional.';
  }

  return parsed;
}

async function chatWithAssistant(reportContext, history, userMessage) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    return chatWithGemini(geminiKey, reportContext, history, userMessage);
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    return chatWithOpenRouter(openRouterKey, reportContext, history, userMessage);
  }

  const client = createBedrockClient(process.env.BEDROCK_API_KEY);
  const systemPrompt = buildChatSystemPrompt(reportContext);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).map((turn) => ({
      role: turn.role === 'model' ? 'assistant' : 'user',
      content: turn.text,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    return await callBedrockWithMessages(client, messages, 512, 0.6);
  } catch (error) {
    console.warn('[AI] Bedrock chat failed, using fallback response:', error.message);
    return 'I’m currently unable to reach the AI service, but I can still help you review the report context. Please consult a qualified healthcare professional for confirmed guidance.';
  }
}

const GEMINI_MODEL_ID = 'gemini-3.6-flash';

async function chatWithGemini(apiKey, reportContext, history, userMessage) {
  const systemPrompt = buildChatSystemPrompt(reportContext);

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    ...(history || []).map((turn) => ({
      role: turn.role === 'model' ? 'model' : 'user',
      parts: [{ text: turn.text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: 512, temperature: 0.6 },
        }),
      }
    );

    const responseText = await response.text();
    if (!response.ok) {
      let message = responseText;
      try {
        message = JSON.parse(responseText).error?.message || responseText;
      } catch (e) {
        /* keep raw text */
      }
      throw new Error(`Gemini request failed (${response.status}): ${message}`);
    }

    const body = JSON.parse(responseText);
    const content = body.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!content) {
      throw new Error('Gemini returned an empty response.');
    }
    return content;
  } catch (error) {
    console.warn('[AI] Gemini chat failed, using fallback response:', error.message);
    return 'I’m currently unable to reach the AI service, but I can still help you review the report context. Please consult a qualified healthcare professional for confirmed guidance.';
  }
}

async function chatWithOpenRouter(apiKey, reportContext, history, userMessage) {
  const systemPrompt = buildChatSystemPrompt(reportContext);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).map((turn) => ({
      role: turn.role === 'model' ? 'assistant' : 'user',
      content: turn.text,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages,
        max_tokens: 512,
        temperature: 0.6,
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`OpenRouter request failed (${response.status}): ${responseText}`);
    }

    const body = JSON.parse(responseText);
    const content = body.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter returned an empty response.');
    }
    return content;
  } catch (error) {
    console.warn('[AI] OpenRouter chat failed, using fallback response:', error.message);
    return 'I’m currently unable to reach the AI service, but I can still help you review the report context. Please consult a qualified healthcare professional for confirmed guidance.';
  }
}

module.exports = {
  analyzeReport,
  chatWithAssistant,
  __test: {
    parseSignedBedrockUrl,
    buildAnthropicPayload,
    buildFallbackAnalysis,
  },
};
