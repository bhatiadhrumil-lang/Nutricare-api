/**
 * rateLimits.js
 * Shared, environment-configurable rate limiters for expensive endpoints.
 *
 *   CHAT_RATE_LIMIT   — max POST /api/chat per window (default 30)
 *   REPORT_RATE_LIMIT — max POST /api/analyze-report per window (default 20)
 *   AGENT_RATE_LIMIT  — max POST /api/agent/analyze per window (default 10)
 *
 * Window is fixed at 15 minutes. Limits are read when the limiter is
 * created (route load time). Buckets are keyed by authenticated user id
 * when available, otherwise by client IP. Exceeding the limit returns
 * HTTP 429 with a JSON body — never the expensive handler.
 */

const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000;

function intEnv(name, fallback) {
  const parsed = Number(process.env[name]);
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  return fallback;
}

function createRateLimiter({ envName, fallbackLimit, message }) {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit: intEnv(envName, fallbackLimit),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.sub || ipKeyGenerator(req.ip),
    handler: (_req, res) => res.status(429).json({
      success: false,
      message,
    }),
  });
}

const chatRateLimit = () => createRateLimiter({
  envName: 'CHAT_RATE_LIMIT',
  fallbackLimit: 30,
  message: 'Too many chat requests. Please try again later.',
});

const reportRateLimit = () => createRateLimiter({
  envName: 'REPORT_RATE_LIMIT',
  fallbackLimit: 20,
  message: 'Too many upload requests. Please try again later.',
});

const agentRateLimit = () => createRateLimiter({
  envName: 'AGENT_RATE_LIMIT',
  fallbackLimit: 10,
  message: 'Too many agent requests. Please try again later.',
});

module.exports = { createRateLimiter, chatRateLimit, reportRateLimit, agentRateLimit };
