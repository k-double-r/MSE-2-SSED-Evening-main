import { createClient } from 'redis';
import { config } from './config.js';

export const redis = createClient({ url: config.redisUrl });
redis.on('error', error => console.error('Redis error:', error.message));

export async function connectRedis() {
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      if (!redis.isOpen) await redis.connect();
      console.log('Redis connection established');
      return;
    } catch (error) {
      console.log(`Waiting for Redis (${attempt}/30): ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Could not connect to Redis after 30 attempts');
}
