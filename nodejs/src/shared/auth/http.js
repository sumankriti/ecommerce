'use strict';

const { verifyAccessToken } = require('./jwt');

function parseCookies(rawCookieHeader = '') {
  return Object.fromEntries(
    rawCookieHeader
      .split(';')
      .filter(Boolean)
      .map((cookie) => cookie.trim().split('=').map(decodeURIComponent)),
  );
}

function buildSetCookie(name, value, options = {}) {
  let cookie = `${name}=${value}`;

  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  if (options.secure) cookie += '; Secure';
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;

  return cookie;
}

function extractBearerToken(req) {
  const authorization = req.headers.authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
}

function requireAuthenticatedUser(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({ error: 'No access token', statusCode: 401 });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Access token expired or invalid', statusCode: 401 });
    return;
  }

  req.user = payload;
  next();
}

module.exports = {
  buildSetCookie,
  extractBearerToken,
  parseCookies,
  requireAuthenticatedUser,
};
