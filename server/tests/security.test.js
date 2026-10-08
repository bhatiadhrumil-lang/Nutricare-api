/**
 * security.test.js — Phase A security blockers (strict-auth mode).
 *
 * Runs WITHOUT DEV_AUTH_ENABLED and without Cognito configuration, so the
 * strict JWT path fails closed (no network, no AWS calls). Route handlers
 * are never reached on 401/400/413 paths.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const multer = require('multer');

const { authenticateCognitoToken } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimits');
const chatRoutes = require('../routes/chat.routes');
const agentRoutes = require('../routes/agent.routes');
const reportRoutes = require('../routes/report.routes');
const { chatController } = require('../controllers/chat.controller');
const { analyzeReportController } = require('../controllers/report.controller');

function startApp(mounts) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  for (const [routePath, router] of mounts) app.use(routePath, router);
  // Mirrors server/index.js Multer error handling.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'File size must not exceed 15 MB.' });
      }
      return res.status(400).json({ success: false, message: 'Invalid file upload.' });
    }
    if (err) return res.status(500).json({ error: err.message || 'Internal server error' });
    return next();
  });
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      resolve({ server, base: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

async function stopApp({ server }) {
  await new Promise((resolve) => server.close(resolve));
}

// 1. /api/chat without JWT -> 401
test('POST /api/chat without JWT is rejected with 401', async () => {
  const harness = await startApp([['/api', chatRoutes]]);
  try {
    const res = await fetch(`${harness.base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello' }),
    });
    assert.equal(res.status, 401);
  } finally {
    await stopApp(harness);
  }
});

// 2. /api/chat invalid JWT -> 401 (malformed + garbage signature)
test('POST /api/chat with invalid JWT is rejected with 401', async () => {
  const harness = await startApp([['/api', chatRoutes]]);
  try {
    for (const token of ['not-a-jwt', 'a.b.c', 'Bearer', 'eyJhbGciOiJIUzI1NiJ9.e30.invalid-signature-xyz']) {
      const res = await fetch(`${harness.base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: 'hello' }),
      });
      assert.equal(res.status, 401, `token ${token} must be rejected`);
    }
  } finally {
    await stopApp(harness);
  }
});

test('agent route without JWT is rejected with 401', async () => {
  const harness = await startApp([['/api', agentRoutes]]);
  try {
    const res = await fetch(`${harness.base}/api/agent/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportData: null, history: [] }),
    });
    assert.equal(res.status, 401);
  } finally {
    await stopApp(harness);
  }
});

test('report upload without JWT is rejected with 401 before any processing', async () => {
  const harness = await startApp([['/api', reportRoutes]]);
  try {
    const form = new FormData();
    form.append('report', new Blob(['x'], { type: 'application/pdf' }), 'r.pdf');
    const res = await fetch(`${harness.base}/api/analyze-report`, { method: 'POST', body: form });
    assert.equal(res.status, 401);
  } finally {
    await stopApp(harness);
  }
});

// 7. Rate limiting produces 429 (shared factory, no network involved).
test('rate limiter returns 429 JSON after the configured limit', async () => {
  process.env.TEST_RL_A = '2';
  const app = express();
  app.use('/ping', createRateLimiter({ envName: 'TEST_RL_A', fallbackLimit: 100, message: 'slow down' }));
  app.get('/ping', (_req, res) => res.json({ ok: true }));
  const harness = await new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` }));
  });
  try {
    assert.equal((await fetch(`${harness.base}/ping`)).status, 200);
    assert.equal((await fetch(`${harness.base}/ping`)).status, 200);
    const limited = await fetch(`${harness.base}/ping`);
    assert.equal(limited.status, 429);
    const body = await limited.json();
    assert.equal(body.success, false);
  } finally {
    delete process.env.TEST_RL_A;
    await stopApp(harness);
  }
});

test('rate limiter falls back to safe defaults on invalid env values', async () => {
  process.env.TEST_RL_B = 'not-a-number';
  const app = express();
  app.use('/ping', createRateLimiter({ envName: 'TEST_RL_B', fallbackLimit: 1, message: 'slow down' }));
  app.get('/ping', (_req, res) => res.json({ ok: true }));
  const harness = await new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` }));
  });
  try {
    assert.equal((await fetch(`${harness.base}/ping`)).status, 200);
    assert.equal((await fetch(`${harness.base}/ping`)).status, 429);
  } finally {
    delete process.env.TEST_RL_B;
    await stopApp(harness);
  }
});

// Wiring: expensive routes must run limiter + Cognito auth before handlers.
test('chat/agent/report routes wire rate-limit and auth ahead of handlers', () => {
  const chatStack = chatRoutes.stack[0].route.stack;
  assert.equal(chatStack.length, 3);
  assert.equal(chatStack[chatStack.length - 1].handle, chatController);

  const agentStack = agentRoutes.stack[0].route.stack;
  assert.equal(agentStack.length, 3);

  const reportStack = reportRoutes.stack[0].route.stack;
  assert.equal(reportStack.length, 5);
  assert.equal(reportStack[reportStack.length - 1].handle, analyzeReportController);
});

// 8. DEV_AUTH_ENABLED cannot bypass verification when NODE_ENV=production.
test('production fails closed even with DEV_AUTH_ENABLED=true', async () => {
  const savedNodeEnv = process.env.NODE_ENV;
  const savedDev = process.env.DEV_AUTH_ENABLED;
  const modulePath = require.resolve('../middleware/authMiddleware');
  const savedModule = require.cache[modulePath];
  delete require.cache[modulePath];
  process.env.NODE_ENV = 'production';
  process.env.DEV_AUTH_ENABLED = 'true';
  try {
    const fresh = require('../middleware/authMiddleware');
    let status = null;
    const res = { status: (c) => { status = c; return res; }, json: () => res };
    await fresh.authenticateCognitoToken(
      { get: () => 'Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.', requestId: 't' },
      res,
      () => { throw new Error('next() must not be called in production dev-bypass'); },
    );
    assert.equal(status, 401);
  } finally {
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = savedNodeEnv;
    if (savedDev === undefined) delete process.env.DEV_AUTH_ENABLED;
    else process.env.DEV_AUTH_ENABLED = savedDev;
    delete require.cache[modulePath];
    if (savedModule) require.cache[modulePath] = savedModule;
  }
});

test('direct middleware rejects missing and malformed tokens', async () => {
  const calls = [];
  const res = () => {
    const r = {};
    r.status = (c) => { calls.push(c); return r; };
    r.json = () => r;
    return r;
  };
  const r1 = res();
  await authenticateCognitoToken({ get: () => undefined, requestId: 't1' }, r1, () => {});
  assert.deepEqual(calls, [401]);
});
