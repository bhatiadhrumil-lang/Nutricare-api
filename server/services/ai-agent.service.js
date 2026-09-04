const { createBedrockClient, callBedrock } = require('./ai.service');

function buildAgentPrompt(userData, reportData, history = []) {
  const profile = userData?.profile || {};
  const preferences = userData?.preferences || {};
  const healthGoals = userData?.healthGoals || [];

  const bloodSummary = reportData ? `Report: ${reportData.fileName || 'Blood Report'}, Status: ${reportData.status || 'Unknown'}, Parameters: ${JSON.stringify(reportData.bloodParameters || [])}` : 'No blood report provided.';
  const userSummary = `Profile: ${profile.fullName || 'Unknown'}, Gender: ${profile.gender || 'N/A'}, Weight: ${profile.weight || 'N/A'}, Activity: ${profile.activityLevel || preferences.activityLevel || 'N/A'}, Goals: ${JSON.stringify(healthGoals)}`;
  const historyContext = history.slice(-3).map((h) => `${h.role}: ${h.text}`).join('\n');

  const promptText = `System: You are a health analysis AI agent for NutriHealth. Given user dashboard data and blood report data, return ONLY a JSON object with exactly these keys: summary (brief body state explanation), foodsToEat (array of strings), foodsToAvoid (array of strings), diseasePrediction (object: {likelyCondition, confidence, indicators: array}), healthTips (array of strings), disclaimer (string with "Not a substitute for professional medical advice").\nUser Dashboard Data:\n${userSummary}\n\nBlood Report Data:\n${bloodSummary}\n\nChat History (last 3 turns):\n${historyContext || 'None'}\n\nGenerate the personalized health analysis JSON.`;

  return promptText;
}

async function analyze(userId, reportData, history) {
  const dbService = require('./db.service');
  const userData = await dbService.getUser(userId);
  const promptText = buildAgentPrompt(userData, reportData, history);

  const client = createBedrockClient(process.env.BEDROCK_API_KEY);
  let rawText;
  try {
    rawText = await callBedrock(client, promptText, 1024, 0.3);
  } catch (e) {
    rawText = '{"summary":"Analysis unavailable — please consult a qualified healthcare professional.","foodsToEat":[],"foodsToAvoid":[],"diseasePrediction":{"likelyCondition":"Unknown","confidence":"Low","indicators":[]},"healthTips":["Review your report with a clinician."],"disclaimer":"This is not medical advice. Please consult a qualified healthcare professional."}';
  }

  const cleaned = (rawText || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    parsed = {
      summary: 'Unable to parse analysis result. Please review your blood report with a qualified healthcare professional.',
      foodsToEat: [],
      foodsToAvoid: [],
      diseasePrediction: { likelyCondition: 'Unknown', confidence: 'Low', indicators: [] },
      healthTips: ['Consult a healthcare professional for a personalized review.'],
      disclaimer: 'This is not medical advice. Please consult a qualified healthcare professional.',
    };
  }
  if (!parsed.disclaimer) {
    parsed.disclaimer = 'This is not medical advice. Please consult a qualified healthcare professional.';
  }
  return parsed;
}

module.exports = { buildAgentPrompt, analyze };
