const { randomUUID } = require('crypto');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const cognitoConfig = {
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  region: process.env.AWS_REGION,
};

// Dev-only fallback. When the backend cannot reach AWS Cognito (e.g. locked-down
// networks, offline demos, or sandboxes that block egress to Cognito), the
// strict JWKS-based verification below fails. In that situation — and ONLY when
// explicitly enabled — we trust the JWT claims locally (decode, no signature
// check) so the demo keeps working. This MUST stay off in production.
const DEV_AUTH_ENABLED = String(process.env.DEV_AUTH_ENABLED || '').toLowerCase() === 'true';

let verifier;

function getVerifier() {
  if (verifier) {
    return verifier;
  }

  const { userPoolId, clientId, region } = cognitoConfig;

  // Fail closed when Cognito has not been configured, or when the supplied
  // user pool does not belong to the configured AWS region.
  if (!userPoolId || !clientId || !region || !userPoolId.startsWith(`${region}_`)) {
    return null;
  }

  verifier = CognitoJwtVerifier.create({
    userPoolId,
    clientId,
    tokenUse: 'access',
  });

  return verifier;
}

// Decode a JWT payload WITHOUT verifying the signature. Dev fallback only.
function decodeJwtUnsafe(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed token');
  }
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  return payload;
}

function getBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const match = authorizationHeader.match(/^Bearer\s+([^\s]+)$/);
  return match ? match[1] : null;
}

function logAuthenticationAttempt(req, userId = null) {
  console.info({
    requestId: req.requestId,
    userId,
    timestamp: new Date().toISOString(),
  });
}

function respondUnauthorized(req, res) {
  logAuthenticationAttempt(req);
  return res.status(401).json({
    success: false,
    message: 'Unauthorized',
  });
}

async function authenticateCognitoToken(req, res, next) {
  req.requestId = req.get('x-request-id') || randomUUID();

  const token = getBearerToken(req.get('authorization'));
  if (!token) {
    return respondUnauthorized(req, res);
  }

  // ── Dev fallback: local decode, no AWS round-trip ───────────────────────
  if (DEV_AUTH_ENABLED) {
    try {
      const payload = decodeJwtUnsafe(token);
      if (!payload.sub) {
        return respondUnauthorized(req, res);
      }
      req.user = {
        sub: payload.sub,
        email: payload.email || payload['cognito:username'] || '',
        username: payload['cognito:username'] || payload.username || payload.sub,
      };
      logAuthenticationAttempt(req, payload.sub);
      return next();
    } catch {
      return respondUnauthorized(req, res);
    }
  }

  // ── Strict path: verify signature + claims against Cognito JWKS ──────────
  const cognitoVerifier = getVerifier();
  if (!cognitoVerifier) {
    return respondUnauthorized(req, res);
  }

  try {
    const payload = await cognitoVerifier.verify(token);
    const userId = payload.sub;

    if (!userId) {
      return respondUnauthorized(req, res);
    }

    req.user = {
      sub: userId,
      email: payload.email,
      username: payload.username || payload['cognito:username'],
    };

    logAuthenticationAttempt(req, userId);
    return next();
  } catch {
    return respondUnauthorized(req, res);
  }
}

module.exports = { authenticateCognitoToken };
