'use strict';

const { SERVICE_PORTS } = require('../../config/services');
const { createServiceApp, finalizeServiceApp } = require('../../shared/http/service-app');
const { CATEGORIES, PRODUCTS } = require('./data');

function createCatalogApp() {
  const app = createServiceApp('catalog-service');

  return finalizeServiceApp(app, (serviceApp) => {
    serviceApp.get('/api/categories', (_req, res) => {
      res.json({
        items: CATEGORIES,
        total: CATEGORIES.length,
      });
    });

    serviceApp.get('/api/products', (req, res) => {
      const categoryId = req.query.categoryId;
      const filteredProducts = categoryId
        ? PRODUCTS.filter((product) => product.categoryId === categoryId)
        : PRODUCTS;

      res.json({
        items: filteredProducts,
        total: filteredProducts.length,
      });
    });

    serviceApp.get('/api/products/:id', (req, res) => {
      const product = PRODUCTS.find((entry) => entry.id === req.params.id);

      if (!product) {
        res.status(404).json({ error: 'Product not found', statusCode: 404 });
        return;
      }

      res.json(product);
    });
  });
}

function startCatalogService() {
  const app = createCatalogApp();

  return new Promise((resolve) => {
    const server = app.listen(SERVICE_PORTS.catalog, () => {
      resolve({
        name: 'catalog-service',
        port: SERVICE_PORTS.catalog,
        server,
      });
    });
  });
}

module.exports = {
  createCatalogApp,
  startCatalogService,
};
