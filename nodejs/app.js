'use strict';

const { startGateway } = require('./src/gateway/server');
const { startAuthService } = require('./src/services/auth/server');
const { startCatalogService } = require('./src/services/catalog/server');
const { startOrderService } = require('./src/services/orders/server');

async function bootstrap() {
  const servers = await Promise.all([
    startAuthService(),
    startCatalogService(),
    startOrderService(),
    startGateway(),
  ]);

  const shutdown = (signal) => {
    console.log(`\nShutting down services (${signal})...`);

    Promise.all(
      servers.map(
        ({ name, server }) =>
          new Promise((resolve, reject) => {
            server.close((error) => {
              if (error) {
                console.error(`Failed to stop ${name}`, error);
                reject(error);
                return;
              }

              console.log(`${name} stopped`);
              resolve();
            });
          }),
      ),
    )
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  console.log('\nMicroservices backend is running.\n');
  console.table(
    servers.map(({ name, port }) => ({
      service: name,
      url: `http://localhost:${port}`,
    })),
  );
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap services', error);
  process.exit(1);
});
