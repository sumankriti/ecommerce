'use strict';

const { startOrderService } = require('./server');

startOrderService().catch((error) => {
  console.error('Failed to start order-service', error);
  process.exit(1);
});
