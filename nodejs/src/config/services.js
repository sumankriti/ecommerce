'use strict';

const SERVICE_PORTS = {
  gateway: 3000,
  auth: 3001,
  catalog: 3002,
  orders: 3003,
};

const SERVICE_URLS = {
  auth: `http://localhost:${SERVICE_PORTS.auth}`,
  catalog: `http://localhost:${SERVICE_PORTS.catalog}`,
  orders: `http://localhost:${SERVICE_PORTS.orders}`,
};

module.exports = {
  SERVICE_PORTS,
  SERVICE_URLS,
};
