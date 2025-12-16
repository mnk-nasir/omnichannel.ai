'use strict';

/**
 * server.js — Gateway Bootstrap
 *
 * Responsibilities:
 *   1. Register middleware / security plugins
 *   2. Register route modules (from ./routes/)
 *   3. Start the server
 *
 * Business logic lives in ./routes/ and ./plugins/.
 * Utility clients live in ./lib/.
 */

require('dotenv').config();

const Fastify       = require('fastify');
const helmet        = require('@fastify/helmet');
const underPressure = require('@fastify/under-pressure');
const Sentry        = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
const { createClient } = require('@supabase/supabase-js');
const { createRedisClient } = require('./lib/redis');
const { initWhatsAppClient } = require('./whatsapp_client');

// ── Observability ──────────────────────────────────────────────────────────────
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// ── Server Instance ────────────────────────────────────────────────────────────
const fastify = Fastify({ logger: true });

// ── Shared Clients (decorated onto fastify so routes can access them) ──────────
const supabase = createClient(
  process.env.SUPABASE_URL  || 'https://xyz.supabase.co',
  process.env.SUPABASE_KEY  || 'dummy_key'
);
const redis = createRedisClient();

fastify.decorate('supabase', supabase);
fastify.decorate('redis',    redis);

redis.on('error', (err) => {
  fastify.log.warn('Redis offline... continuing without cache.');
});

// ── Security & Infrastructure Plugins ─────────────────────────────────────────
fastify.register(require('@fastify/cors'), {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});

fastify.register(helmet, { contentSecurityPolicy: false, global: true });

fastify.register(underPressure, {
  maxEventLoopDelay: 5000,
  maxHeapUsedBytes:  2_000_000_000,
  maxRssBytes:       2_000_000_000,
  exposeStatusRoute: '/health',
  message: 'Service is temporarily under high load. Retry shortly.'
});

fastify.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
  keyGenerator: (req) => req.user?.business_id || req.ip,
  redis: redis,
  continueExceeding: true,
  skipFailedRequests: true
});

fastify.register(require('@fastify/cookie'), {
  secret: process.env.COOKIE_SECRET || 'omnichannel_cookie_secret'
});

fastify.register(require('@fastify/jwt'), {
  secret: process.env.SUPABASE_JWT_SECRET || 'your-supabase-jwt-secret-here'
});

fastify.register(require('@fastify/csrf-protection'), {
  cookieOpts: { signed: true }
});

// ── Multipart (file uploads for Knowledge Base) ────────────────────────────────
fastify.register(require('@fastify/multipart'), {
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB max
});

// ── Auth Plugin ────────────────────────────────────────────────────────────────
fastify.register(require('./plugins/auth'));


// ── Route Modules ──────────────────────────────────────────────────────────────
fastify.register(require('./routes/whatsapp'));
fastify.register(require('./routes/agents'));
fastify.register(require('./routes/voice'));
fastify.register(require('./routes/webhooks'));
fastify.register(require('./routes/conversations'));

fastify.register(require('./routes/rag'));

// ── Server Start ───────────────────────────────────────────────────────────────
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`🚀 Gateway running on port ${port}`);

    try {
      initWhatsAppClient();
    } catch (err) {
      fastify.log.error('WhatsApp Client init failed:', err);
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
