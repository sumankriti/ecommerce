'use strict';

const { startGateway } = require('./server');

startGateway().catch((error) => {
  console.error('Failed to start api-gateway', error);
  process.exit(1);
});
