/**
 * security-auth.test.js — Phase A security blockers (authenticated mode).
 *
 * DEV_AUTH_ENABLED=true lets tests use locally-decoded JWTs (no Cognito
 * network). BEDROCK_TIMEOUT_MS=100 forces fast Bedrock failure so no test
 * waits on the network. dbService is stubbed via the require cache so no
 * user data is read or written.
 *
 * NOTE: POST /api/chat with a *valid* JWT is intentionally not covered here:
 * the handler would reach the live AI providers. It is covered by the live
 * HTTP smoke test instead.
 */
process.env.DEV_AUTH_ENABLED = 'true';
process.env.NODE_ENV = 'test';
process.env.BEDROCK_TIMEOUT_MS = '100';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const multer = require('multer');

const chatRoutes = require('../routes/chat.routes');
const agentRoutes = require('../routes/agent.routes');
const reportRoutes = require('../routes/report.routes');
const dbService = require('../services/db.service');

const ATTACKER_SUB = 'attacker-sub';
const VICTIM_SUB = 'victim-sub';

function devJwt(sub) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'none' })}.${b64({ sub })}.`;
}

// Stub the data layer: victim must never be loaded; nothing is persisted.
const origGetUser = dbService.getUser;
const origAddReport = dbService.addReportRecord;
dbService.getUser = async (uid) => {
  if (uid === VICTIM_SUB) throw new Error('victim data must never be loaded');
  return {
    profile: { fullName: `User ${uid}`, email: '', phone: '', dob: '', gender: '', height: null, weight: null, activityLevel: '' },
    preferences: {},
    healthGoals: [],
    medicalInformation: {},
    reports: [],
  };
};
dbService.addReportRecord = async () => ({});
test.after(() => {
  dbService.getUser = origGetUser;
  dbService.addReportRecord = origAddReport;
});

function startApp(mounts) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  for (const [routePath, router] of mounts) app.use(routePath, router);
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

function tinyPdf(lines) {
  const stream = lines.map((s, i) => `BT /F1 12 Tf 72 ${720 - i * 20} Td (${s}) Tj ET\n`).join('');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offs = [0];
  objs.forEach((body, i) => {
    offs.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const o of offs.slice(1)) pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sec-')), 'r.pdf');
  fs.writeFileSync(file, pdf);
  return file;
}

// 4. /api/agent/analyze cannot use another userId (IDOR regression).
test('agent rejects a body userId that does not match the JWT subject', async () => {
  const harness = await startApp([['/api', agentRoutes]]);
  try {
    const res = await fetch(`${harness.base}/api/agent/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devJwt(ATTACKER_SUB)}` },
      body: JSON.stringify({ userId: VICTIM_SUB, reportData: null, history: [] }),
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /does not match/i);
  } finally {
    await stopApp(harness);
  }
});

test('agent with no body userId serves the authenticated user, never the victim', async () => {
  const harness = await startApp([['/api', agentRoutes]]);
  try {
    const res = await fetch(`${harness.base}/api/agent/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devJwt(ATTACKER_SUB)}` },
      body: JSON.stringify({ reportData: null, history: [] }),
    });
    // 200 proves the victim stub was never consulted (it throws -> 500).
    assert.equal(res.status, 200);
  } finally {
    await stopApp(harness);
  }
});

// 5. Report upload works end-to-end with a valid JWT (OCR + pipeline + marked fallback).
test('authenticated report upload completes the full pipeline', async () => {
  const harness = await startApp([['/api', reportRoutes]]);
  const pdfPath = tinyPdf(['Hemoglobin 13.2 g/dL 12.0 - 15.0']);
  try {
    const buf = fs.readFileSync(pdfPath);
    const form = new FormData();
    form.append('report', new Blob([buf], { type: 'application/pdf' }), 'r.pdf');
    const res = await fetch(`${harness.base}/api/analyze-report`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${devJwt(ATTACKER_SUB)}` },
      body: form,
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.bloodParameters) && body.bloodParameters.length > 0);
    assert.match(body.bloodParameters[0].name, /hemoglobin/i);
    assert.equal(body.source, 'fallback');
    assert.equal(body.success, false);
  } finally {
    fs.rmSync(path.dirname(pdfPath), { recursive: true, force: true });
    await stopApp(harness);
  }
});

// 6. Oversized upload rejected with 413 before any processing.
test('oversized upload is rejected with 413', async () => {
  const harness = await startApp([['/api', reportRoutes]]);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sec-big-'));
  const big = path.join(dir, 'big.pdf');
  fs.writeFileSync(big, Buffer.alloc(16 * 1024 * 1024, 0));
  try {
    const form = new FormData();
    form.append('report', new Blob([fs.readFileSync(big)], { type: 'application/pdf' }), 'big.pdf');
    const res = await fetch(`${harness.base}/api/analyze-report`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${devJwt(ATTACKER_SUB)}` },
      body: form,
    });
    assert.equal(res.status, 413);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    await stopApp(harness);
  }
});

test('malformed JWT is rejected even in dev mode', async () => {
  const harness = await startApp([['/api', chatRoutes]]);
  try {
    const res = await fetch(`${harness.base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer garbage' },
      body: JSON.stringify({ message: 'hi' }),
    });
    assert.equal(res.status, 401);
  } finally {
    await stopApp(harness);
  }
});
