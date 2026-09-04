const express = require('express');
const { analyze } = require('../services/ai-agent.service');
const { authenticateCognitoToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/agent/analyze', authenticateCognitoToken, async (req, res) => {
  try {
    const { userId, reportData, history } = req.body;
    if (!userId && !req.user?.sub) {
      return res.status(400).json({ error: 'userId or authenticated user required' });
    }
    const uid = userId || req.user.sub;
    const result = await analyze(uid, reportData || null, history || []);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[Agent Endpoint Error]', err.message);
    return res.status(500).json({ error: 'Agent analysis failed.', details: err.message });
  }
});

module.exports = router;
