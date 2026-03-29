'use strict';

const { startAuthService } = require('./server');

startAuthService().catch((error) => {
  console.error('Failed to start auth-service', error);
  process.exit(1);
});
