'use strict';

const express = require('express');
const { SERVICE_PORTS, SERVICE_URLS } = require('../config/services');
const { errorHandler, notFound } = require('../shared/http/respond');
const { proxyTo } = require('../shared/http/proxy');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'http://localhost:4200',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

function setCors(res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

function createGatewayApp() {
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    setCors(res);
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      service: 'api-gateway',
      status: 'ok',
      timestamp: new Date().toISOString(),
      routes: {
        auth: '/api/auth/*, /api/me',
        catalog: '/api/products/*, /api/categories',
        orders: '/api/orders/*',
      },
      downstream: SERVICE_URLS,
    });
  });

  app.use('/api/auth', proxyTo(SERVICE_URLS.auth));
  app.use('/api/me', proxyTo(SERVICE_URLS.auth));
  app.use('/api/products', proxyTo(SERVICE_URLS.catalog));
  app.use('/api/categories', proxyTo(SERVICE_URLS.catalog));
  app.use('/api/orders', proxyTo(SERVICE_URLS.orders));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

function startGateway() {
  const app = createGatewayApp();

  return new Promise((resolve) => {
    const server = app.listen(SERVICE_PORTS.gateway, () => {
      resolve({
        name: 'api-gateway',
        port: SERVICE_PORTS.gateway,
        server,
      });
    });
  });
}

module.exports = {
  createGatewayApp,
  startGateway,
};
