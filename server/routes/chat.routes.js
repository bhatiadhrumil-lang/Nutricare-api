/**
 * chat.routes.js
 * POST /api/chat
 */

const express = require('express');
const { chatController } = require('../controllers/chat.controller');
const { authenticateCognitoToken } = require('../middleware/authMiddleware');
const { chatRateLimit } = require('../middleware/rateLimits');

const router = express.Router();

// Rate limit runs before authentication so unauthenticated floods are
// rejected cheaply (IP-keyed); authenticated callers are keyed by user id.
router.post('/chat', chatRateLimit(), authenticateCognitoToken, chatController);

module.exports = router;
