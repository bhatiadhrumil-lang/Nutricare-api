const express = require('express');
const { analyze } = require('../services/ai-agent.service');
const { authenticateCognitoToken } = require('../middleware/authMiddleware');
const { agentRateLimit } = require('../middleware/rateLimits');

const router = express.Router();

router.post('/agent/analyze', agentRateLimit(), authenticateCognitoToken, async (req, res) => {
  try {
    // NEVER trust a client-supplied identity: a mismatched userId is either
    // a bug or an attempt to read another user's health data.
    if (req.body?.userId && req.body.userId !== req.user?.sub) {
      return res.status(403).json({ error: 'Forbidden: userId does not match authenticated user.' });
    }
    if (!req.user?.sub) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const uid = req.user.sub;
    const { reportData, history } = req.body || {};
    const result = await analyze(uid, reportData || null, history || []);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[Agent Endpoint Error]', err.message);
    return res.status(500).json({ error: 'Agent analysis failed.', details: err.message });
  }
});

module.exports = router;
