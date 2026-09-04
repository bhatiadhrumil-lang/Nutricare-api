# AI Agent Design Spec — NutriHealth

**Date:** 2025-08-30
**Path:** `docs/superpowers/specs/YYYY-MM-DD-ai-agent-design.md`
**Status:** Approved

---

## 1. Purpose
Build a backend AI agent module (`ai-agent.service.js`) that consumes a user's dashboard profile + blood report data and produces personalized health analysis output. The agent feeds both the existing AI Assistant chat (`/api/chat`) and the Results page (`Results.jsx`).

---

## 2. Architecture
- **New service:** `server/services/ai-agent.service.js`
- **LLM provider:** AWS Bedrock (`@aws-sdk/client-bedrock-runtime`) — matches existing `.env` (`BEDROCK_API_KEY`, `BEDROCK_REGION`, AWS IAM credentials)
- **Data sources:**
  - User dashboard (`db.service.getUser`) — profile, preferences, health goals, medical info
  - Blood report context (`reportData` from `report.controller.js` / `upload` flow)
  - Optional chat history (`history` array from `/api/chat` requests)
- **New endpoint:** `POST /api/agent/analyze` (optional; primary integration is through existing endpoints)
- **Integration points:**
  - Injected into `/api/analyze-report` response
  - Injected into `/api/chat` response
  - Rendered on `Results.jsx`

---

## 3. Component Design

### 3.1 `ai-agent.service.js`
Public async methods:
- `buildAgentPrompt(userData, reportData, history)` — constructs the structured prompt combining dashboard data + blood markers + chat context.
- `analyze(userId, reportData, history)` — calls Bedrock with prompt, parses JSON response.

### 3.2 Prompt Structure
Includes:
- User profile summary (age, gender, weight, activity)
- Blood parameters (HbA1c, glucose, LDL, etc.)
- Health goals and dietary preferences
- Disease risk rules (diabetes indicators from high glucose/HbA1c)
- Explicit instruction: return JSON with `summary`, `foodsToEat`, `foodsToAvoid`, `diseasePrediction`, `healthTips`, `disclaimer`

### 3.3 Response Schema
```json
{
  "summary": "Brief summary of body state from blood markers...",
  "foodsToEat": ["..."],
  "foodsToAvoid": ["..."],
  "diseasePrediction": {
    "likelyCondition": "Pre-diabetic / Diabetic risk",
    "confidence": "High / Medium / Low",
    "indicators": ["HbA1c 7.8%", "Fasting Glucose 140 mg/dL"]
  },
  "healthTips": ["..."],
  "disclaimer": "Not a substitute for professional medical advice..."
}
```

---

## 4. Integration Flow
```
Dashboard Data (DB)  -->  ai-agent.service  -->  /api/analyze-report
Blood Report (PDF)   -->         |          -->  Results.jsx
Chat History         -->         |          -->  /api/chat
```

---

## 5. Error Handling
- If Bedrock times out: return graceful degradation message (use existing `gemini.service.js` fallback or static response)
- If user/dashboard data missing: agent uses blood report only + defaults
- Always include `disclaimer`

---

## 6. Testing
- Unit tests for `buildAgentPrompt` structure
- Integration test for `/api/agent/analyze` endpoint
- Mock Bedrock response to avoid real API calls in tests

---

## 7. Trade-offs
- Uses Bedrock (existing infra) instead of OpenRouter/Gemini to keep auth consistent
- New module keeps `gemini.service.js` untouched
- Does NOT create a separate micro-service; stays within Express app
