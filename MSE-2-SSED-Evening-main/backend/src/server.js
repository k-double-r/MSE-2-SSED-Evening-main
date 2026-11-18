import app from './app.js';
import { config } from './config.js';
import { waitForDatabase } from './db.js';
import { connectRedis, redis } from './redis.js';

await waitForDatabase();
await connectRedis();

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`TaskFlow API listening on ${config.port}`);
});

async function shutdown() {
  server.close();
  if (redis.isOpen) await redis.quit();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
