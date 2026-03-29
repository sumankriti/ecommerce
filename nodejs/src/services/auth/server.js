'use strict';

const crypto = require('crypto');
const { SERVICE_PORTS } = require('../../config/services');
const { AUTH_CONFIG, issueAccessToken, issueRefreshToken, verifyRefreshToken } = require('../../shared/auth/jwt');
const { buildSetCookie, parseCookies, requireAuthenticatedUser } = require('../../shared/auth/http');
const { createServiceApp, finalizeServiceApp } = require('../../shared/http/service-app');
const { USERS, refreshTokenStore } = require('./data');

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findUserById(userId) {
  return USERS.find((user) => user.id === userId);
}

function findUserByEmail(email) {
  return USERS.find((user) => user.email.toLowerCase() === email.toLowerCase().trim());
}

function revokeRefreshToken(jti) {
  refreshTokenStore.delete(jti);
}

function revokeAllRefreshTokens(userId) {
  for (const [jti, value] of refreshTokenStore.entries()) {
    if (value.userId === userId) {
      refreshTokenStore.delete(jti);
    }
  }
}

function issueAndStoreRefreshToken(userId) {
  const { token, payload } = issueRefreshToken(userId);

  refreshTokenStore.set(payload.jti, {
    userId,
    expiresAt: payload.exp * 1000,
  });

  return token;
}

function createAuthApp() {
  const app = createServiceApp('auth-service');

  return finalizeServiceApp(app, (serviceApp) => {
    serviceApp.post('/api/auth/login', async (req, res) => {
      const { email = '', password = '' } = req.body || {};
      await delay(250);

      const user = findUserByEmail(email);
      const passwordMatch = user
        ? crypto.timingSafeEqual(Buffer.from(password), Buffer.from(user.password))
        : false;

      if (!user || !passwordMatch) {
        res.status(401).json({ error: 'Invalid email or password', statusCode: 401 });
        return;
      }

      const accessToken = issueAccessToken(user);
      const refreshToken = issueAndStoreRefreshToken(user.id);

      res.setHeader(
        'Set-Cookie',
        buildSetCookie(AUTH_CONFIG.refreshCookieName, refreshToken, {
          httpOnly: true,
          sameSite: 'Strict',
          path: '/api/auth',
          maxAge: AUTH_CONFIG.refreshTokenTtlSeconds,
        }),
      );

      res.json({
        accessToken,
        expiresIn: AUTH_CONFIG.accessTokenTtlSeconds,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      });
    });

    serviceApp.post('/api/auth/refresh', (req, res) => {
      const cookies = parseCookies(req.headers.cookie);
      const refreshToken = cookies[AUTH_CONFIG.refreshCookieName];

      if (!refreshToken) {
        res.status(401).json({ error: 'No refresh token', statusCode: 401 });
        return;
      }

      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        res.status(401).json({ error: 'Refresh token expired or invalid', statusCode: 401 });
        return;
      }

      const storedToken = refreshTokenStore.get(payload.jti);
      if (!storedToken) {
        res.status(401).json({ error: 'Refresh token revoked', statusCode: 401 });
        return;
      }

      const user = findUserById(payload.sub);
      if (!user) {
        res.status(401).json({ error: 'User not found', statusCode: 401 });
        return;
      }

      revokeRefreshToken(payload.jti);

      const accessToken = issueAccessToken(user);
      const newRefreshToken = issueAndStoreRefreshToken(user.id);

      res.setHeader(
        'Set-Cookie',
        buildSetCookie(AUTH_CONFIG.refreshCookieName, newRefreshToken, {
          httpOnly: true,
          sameSite: 'Strict',
          path: '/api/auth',
          maxAge: AUTH_CONFIG.refreshTokenTtlSeconds,
        }),
      );

      res.json({
        accessToken,
        expiresIn: AUTH_CONFIG.accessTokenTtlSeconds,
      });
    });

    serviceApp.post('/api/auth/logout', (req, res) => {
      const cookies = parseCookies(req.headers.cookie);
      const refreshToken = cookies[AUTH_CONFIG.refreshCookieName];

      if (refreshToken) {
        const payload = verifyRefreshToken(refreshToken);
        if (payload) {
          if (req.body?.everywhere) {
            revokeAllRefreshTokens(payload.sub);
          } else {
            revokeRefreshToken(payload.jti);
          }
        }
      }

      res.setHeader(
        'Set-Cookie',
        buildSetCookie(AUTH_CONFIG.refreshCookieName, '', {
          httpOnly: true,
          sameSite: 'Strict',
          path: '/api/auth',
          maxAge: 0,
        }),
      );

      res.json({ message: 'Logged out' });
    });

    serviceApp.get('/api/me', requireAuthenticatedUser, (req, res) => {
      const user = findUserById(req.user.sub);

      if (!user) {
        res.status(401).json({ error: 'User not found', statusCode: 401 });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      });
    });

    serviceApp.get('/api/health', (_req, res) => {
      res.json({
        service: 'auth-service',
        status: 'ok',
        timestamp: new Date().toISOString(),
        users: USERS.map(({ email, roles }) => ({ email, roles })),
      });
    });
  });
}

function startAuthService() {
  const app = createAuthApp();

  return new Promise((resolve) => {
    const server = app.listen(SERVICE_PORTS.auth, () => {
      resolve({
        name: 'auth-service',
        port: SERVICE_PORTS.auth,
        server,
      });
    });
  });
}

module.exports = {
  createAuthApp,
  startAuthService,
};
