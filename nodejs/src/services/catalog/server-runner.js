'use strict';

const { startCatalogService } = require('./server');

startCatalogService().catch((error) => {
  console.error('Failed to start catalog-service', error);
  process.exit(1);
});
