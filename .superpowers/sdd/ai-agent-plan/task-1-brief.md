Task: Create server/services/ai-agent.service.js
Files: server/services/ai-agent.service.js (new)
Interfaces: buildAgentPrompt(userData, reportData, history) -> string; analyze(userId, reportData, history) -> object
Constraints: Use @aws-sdk/client-bedrock-runtime; always include disclaimer; never expose credentials; module name exact.
