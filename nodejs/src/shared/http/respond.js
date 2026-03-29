'use strict';

function notFound(req, res) {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
}

function errorHandler(error, _req, res, _next) {
  console.error('[ERROR]', error);

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message || 'Internal server error',
    statusCode,
  });
}

module.exports = {
  errorHandler,
  notFound,
};
