const { randomUUID } = require('crypto');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const cognitoConfig = {
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  region: process.env.AWS_REGION,
};

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
  const cognitoVerifier = getVerifier();

  if (!token || !cognitoVerifier) {
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
