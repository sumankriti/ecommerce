'use strict';

const express = require('express');
const { errorHandler, notFound } = require('./respond');

function createServiceApp(serviceName) {
  const app = express();

  app.use(express.json());
  app.locals.serviceName = serviceName;

  return app;
}

function finalizeServiceApp(app, registerRoutes) {
  registerRoutes(app);

  app.get('/api/health', (_req, res) => {
    res.json({
      service: app.locals.serviceName,
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createServiceApp,
  finalizeServiceApp,
};
