'use strict';

const crypto = require('crypto');

const AUTH_CONFIG = {
  accessTokenTtlSeconds: 15 * 60,
  refreshTokenTtlSeconds: 7 * 24 * 60 * 60,
  accessTokenSecret: 'nexus-dummy-secret-do-not-use-in-prod',
  refreshTokenSecret: 'nexus-refresh-secret-do-not-use-in-prod',
  refreshCookieName: 'refresh_token',
};

const b64url = {
  encode(value) {
    return Buffer.from(value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  },
  decode(value) {
    return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  },
};

function signJwt(payload, secret, expiresInSeconds) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const issuedAt = Math.floor(Date.now() / 1000);

  const fullPayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
    jti: crypto.randomUUID(),
  };

  const signingInput = [
    b64url.encode(JSON.stringify(header)),
    b64url.encode(JSON.stringify(fullPayload)),
  ].join('.');

  const signature = crypto.createHmac('sha256', secret).update(signingInput).digest();

  return `${signingInput}.${b64url.encode(signature)}`;
}

function verifyJwt(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const signingInput = `${parts[0]}.${parts[1]}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(signingInput).digest();
    const providedSignature = b64url.decode(parts[2]);

    if (expectedSignature.length !== providedSignature.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(expectedSignature, providedSignature)) {
      return null;
    }

    const payload = JSON.parse(b64url.decode(parts[1]).toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function issueAccessToken(user) {
  return signJwt(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    },
    AUTH_CONFIG.accessTokenSecret,
    AUTH_CONFIG.accessTokenTtlSeconds,
  );
}

function issueRefreshToken(userId) {
  const token = signJwt(
    { sub: userId },
    AUTH_CONFIG.refreshTokenSecret,
    AUTH_CONFIG.refreshTokenTtlSeconds,
  );
  const payload = JSON.parse(b64url.decode(token.split('.')[1]).toString('utf8'));

  return {
    token,
    payload,
  };
}

function verifyAccessToken(token) {
  return verifyJwt(token, AUTH_CONFIG.accessTokenSecret);
}

function verifyRefreshToken(token) {
  return verifyJwt(token, AUTH_CONFIG.refreshTokenSecret);
}

module.exports = {
  AUTH_CONFIG,
  issueAccessToken,
  issueRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
