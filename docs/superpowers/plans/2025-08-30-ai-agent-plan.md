# AI Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `ai-agent.service.js` using Bedrock API to generate personalized health analysis from user dashboard + blood report data, integrated into chat and result page.

**Architecture:** New service module with Bedrock runtime client, structured prompt builder, JSON response parser. Injected into existing endpoints (`/api/analyze-report`, `/api/chat`, `Results.jsx`).

**Tech Stack:** Node.js, `@aws-sdk/client-bedrock-runtime`, existing `pg` / `db.service`, React frontend.

**Spec:** `docs/superpowers/specs/2025-08-30-ai-agent-design.md`

---

## Global Constraints
- Use `BEDROCK_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BEDROCK_REGION=us-east-2` from `.env`
- Always include `disclaimer` in agent output
- Never expose Bedrock credentials to client
- Module name: `ai-agent.service.js`
- No separate micro-service; stays inside Express app

---

## File Structure
- Create: `server/services/ai-agent.service.js`
- Modify: `server/routes/report.routes.js` (optional injection)
- Modify: `server/routes/chat.routes.js` (optional injection)
- Modify: `NutriHealth-main/src/Results.jsx`
- Create: `tests/ai-agent.service.test.js`

---

### Task 1: Create `ai-agent.service.js`

**Files:**
- Create: `server/services/ai-agent.service.js`

**Interfaces:**
- Consumes: `process.env` (Bedrock/AWS), `db.service.getUser()`, `reportData`
- Produces: `analyze(userId, reportData, history)` → object with `summary`, `foodsToEat`, `foodsToAvoid`, `diseasePrediction`, `healthTips`, `disclaimer`

- [ ] **Step 1: Write the service skeleton**

```javascript
// server/services/ai-agent.service.js
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function buildAgentPrompt(userData, reportData, history = []) {
  // Structure: user profile + blood params + health goals + chat history summary
  return JSON.stringify({
    system: "You are a health analysis agent...",
    userContext: userData,
    bloodReport: reportData,
    historySummary: history.slice(-3).map(h => `${h.role}: ${h.text}`),
    instructions: "Return JSON only: {summary, foodsToEat, foodsToAvoid, diseasePrediction, healthTips, disclaimer}"
  });
}

async function analyze(userId, reportData, history) {
  const { getUser } = require('./db.service');
  const userData = await getUser(userId);
  const prompt = buildAgentPrompt(userData, reportData, history);

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
    body: JSON.stringify({ prompt, max_tokens: 1024 }),
    contentType: 'application/json',
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder('utf-8').decode(response.body));
  return JSON.parse(result.completion || result.content[0].text);
}

module.exports = { buildAgentPrompt, analyze };
```

- [ ] **Step 2: Verify Bedrock module imports**

Run: `node -e "const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime'); console.log('import ok')"`
Expected: `import ok`

- [ ] **Step 3: Commit**

```bash
git add server/services/ai-agent.service.js
git commit -m "feat: add ai-agent.service with Bedrock integration"
```

---

### Task 2: Add endpoint / integration hook

**Files:**
- Modify: `server/routes/report.routes.js`
- Modify: `server/routes/chat.routes.js`

**Interfaces:**
- Consumes: `ai-agent.service.analyze`
- Produces: Enriched response on `/api/analyze-report` and `/api/chat`

- [ ] **Step 1: Modify report route to inject agent output**

In `report.routes.js`, after existing analysis, add:
```javascript
const agent = require('../services/ai-agent.service');
// inside controller: const agentResult = await agent.analyze(req.user.id, resultData);
```

- [ ] **Step 2: Modify chat route to include agent context**

In `chat.routes.js`, pass agent result into reply generation when `reportContext` is present.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: integrate ai-agent into report and chat routes"
```

---

### Task 3: Update frontend result page

**Files:**
- Modify: `NutriHealth-main/src/Results.jsx`

**Interfaces:**
- Consumes: API response including agent fields
- Produces: Rendered sections for `summary`, `foodsToEat`, `foodsToAvoid`, `diseasePrediction`, `healthTips`, `disclaimer`

- [ ] **Step 1: Read agent fields from props/state**
- [ ] **Step 2: Render new sections with conditional display**
- [ ] **Step 3: Add disclaimer banner at bottom**
- [ ] **Step 4: Commit**

---

### Task 4: Tests

**Files:**
- Create: `tests/ai-agent.service.test.js`

- [ ] **Step 1: Mock Bedrock response**
- [ ] **Step 2: Assert `analyze()` returns correct JSON schema**
- [ ] **Step 3: Assert `disclaimer` is always present**
- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS
- [ ] **Step 5: Commit**

---

## Execution Handoff
Plan complete and saved to `docs/superpowers/plans/2025-08-30-ai-agent-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - Fresh subagent per task, review between tasks
**2. Inline Execution** - Execute tasks in this session using `executing-plans` with checkpoints

Which approach?
