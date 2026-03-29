'use strict';

const crypto = require('crypto');
const { SERVICE_PORTS } = require('../../config/services');
const { requireAuthenticatedUser } = require('../../shared/auth/http');
const { createServiceApp, finalizeServiceApp } = require('../../shared/http/service-app');
const { ORDERS } = require('./data');

function createOrderApp() {
  const app = createServiceApp('order-service');

  return finalizeServiceApp(app, (serviceApp) => {
    serviceApp.get('/api/orders', requireAuthenticatedUser, (req, res) => {
      const orders = ORDERS.filter((order) => order.userId === req.user.sub);
      res.json({
        items: orders,
        total: orders.length,
      });
    });

    serviceApp.post('/api/orders', requireAuthenticatedUser, (req, res) => {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];

      if (items.length === 0) {
        res.status(400).json({ error: 'Order items are required', statusCode: 400 });
        return;
      }

      const total = items.reduce(
        (sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
        0,
      );

      const order = {
        id: `ord_${crypto.randomUUID().slice(0, 8)}`,
        userId: req.user.sub,
        status: 'CREATED',
        items,
        total: Number(total.toFixed(2)),
      };

      ORDERS.push(order);
      res.status(201).json(order);
    });
  });
}

function startOrderService() {
  const app = createOrderApp();

  return new Promise((resolve) => {
    const server = app.listen(SERVICE_PORTS.orders, () => {
      resolve({
        name: 'order-service',
        port: SERVICE_PORTS.orders,
        server,
      });
    });
  });
}

module.exports = {
  createOrderApp,
  startOrderService,
};
