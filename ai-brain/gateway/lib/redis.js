// lib/redis.js — shared Redis client factory
// Handles both redis:// (plain) and rediss:// (TLS/SSL, used by Railway)
const Redis = require('ioredis');

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  const isSSL = redisUrl.startsWith('rediss://');

  const client = new Redis(redisUrl, {
    tls: isSSL ? { rejectUnauthorized: false } : undefined,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: false,
  });

  client.on('connect', () => console.log('[Redis] Connected ✅'));
  client.on('error', (err) => console.error('[Redis] Connection error:', err.message || err.code || err));

  return client;
}

module.exports = { createRedisClient };
