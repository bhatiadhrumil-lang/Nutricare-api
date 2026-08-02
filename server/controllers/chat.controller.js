/**
 * chat.controller.js
 * Handles POST /api/chat
 *
 * Body:
 *   {
 *     message: string,                  // The user's question
 *     reportContext: object | null,      // The analyzed report JSON (if uploaded)
 *     history: [{ role, text }]         // Prior conversation turns
 *   }
 */

const { chatWithAssistant } = require('../services/ai.service');

/**
 * POST /api/chat
 */
async function chatController(req, res) {
  const { message, reportContext = null, history = [] } = req.body;

  // ── Validate ─────────────────────────────────────────────
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  if (message.trim().length > 1000) {
    return res.status(400).json({ error: 'Message too long. Please keep it under 1000 characters.' });
  }

  try {
    console.log(`[Chat] User: "${message.slice(0, 80)}..."`);
    const reply = await chatWithAssistant(reportContext, history, message.trim());
    console.log(`[Chat] Assistant replied (${reply.length} chars)`);

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[Chat Controller Error]', err.message);

    if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
      return res.status(500).json({
        error: 'Gemini API key is invalid or missing. Please check your server/.env file.',
      });
    }

    return res.status(500).json({
      error: err.message || 'Failed to get a response. Please try again.',
    });
  }
}

module.exports = { chatController };
