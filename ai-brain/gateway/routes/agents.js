'use strict';

/**
 * routes/agents.js
 * Transparent proxy routes for AI Brain's agent CRUD API.
 * Allows the Vercel Dashboard to call the Gateway public URL and have
 * requests forwarded to the internal Brain service.
 */

const getBrainUrl = () => (process.env.BRAIN_URL || 'http://127.0.0.1:8000').trim();

async function agentsRoutes(fastify) {

  // GET /api/agents?business_id=...
  fastify.get('/api/agents', async (request, reply) => {
    const brainUrl = getBrainUrl();
    let business_id = request.query.business_id;
    if (!business_id || business_id === 'null' || business_id === 'undefined') {
      business_id = '00000000-0000-4000-8000-000000000001';
    }
    fastify.log.info({ business_id }, '🧠 [AGENT_PROXY] Fetching agents from Brain...');
    try {
      const response = await fetch(`${brainUrl}/api/agents?business_id=${business_id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      fastify.log.info({ count: Array.isArray(data) ? data.length : 1 }, '🧠 [AGENT_PROXY] Returned to client.');
      return reply.code(response.status).send(data);
    } catch (error) {
      fastify.log.error({ error: error.message }, '🧠 [AGENT_PROXY] Brain connection failed');
      return reply.code(500).send({ error: 'Brain connection failed', details: error.message });
    }
  });

  // POST /api/agents — Create a new agent
  fastify.post('/api/agents', async (request, reply) => {
    const brainUrl = getBrainUrl();
    try {
      const response = await fetch(`${brainUrl}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body)
      });
      const data = await response.json().catch(() => ({}));
      return reply.code(response.ok ? 200 : response.status).send(data);
    } catch (error) {
      return reply.code(500).send({ error: 'Brain connection failed', details: error.message });
    }
  });

  // PATCH /api/agents?id=... — Update an agent
  fastify.patch('/api/agents', async (request, reply) => {
    const brainUrl = getBrainUrl();
    const id = request.query.id;
    if (!id) return reply.code(400).send({ error: 'Missing agent id' });
    try {
      const response = await fetch(`${brainUrl}/api/agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body)
      });
      const data = await response.json().catch(() => ({}));
      return reply.code(response.ok ? 200 : response.status).send(data);
    } catch (error) {
      return reply.code(500).send({ error: 'Brain connection failed', details: error.message });
    }
  });

  // DELETE /api/agents?id=... — Delete an agent
  fastify.delete('/api/agents', async (request, reply) => {
    const brainUrl = getBrainUrl();
    const id = request.query.id;
    if (!id) return reply.code(400).send({ error: 'Missing agent id' });
    try {
      const response = await fetch(`${brainUrl}/api/agents/${id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({ status: 'deleted' }));
      return reply.code(response.ok ? 200 : response.status).send(data);
    } catch (error) {
      return reply.code(500).send({ error: 'Brain connection failed', details: error.message });
    }
  });
  // POST /api/templates/deploy — Deploy a template as a new agent
  fastify.post('/api/templates/deploy', async (request, reply) => {
    const brainUrl = getBrainUrl();
    let payload = {};

    // Check if it's multipart (Dashboard sends FormData)
    if (request.isMultipart()) {
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          continue;
        } else {
          if (part.fieldname === 'context') {
            try { payload.context = JSON.parse(part.value); } catch (e) { payload.context = part.value; }
          } else {
            payload[part.fieldname] = part.value;
          }
        }
      }
    } else {
      payload = request.body;
    }

    fastify.log.info({ payload }, '🧠 [AGENT_PROXY] Deploying template via Brain...');

    try {
      const response = await fetch(`${brainUrl}/api/templates/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      return reply.code(response.ok ? 200 : response.status).send(data);
    } catch (error) {
      fastify.log.error({ error: error.message }, '🧠 [AGENT_PROXY] Deployment proxy failed');
      return reply.code(500).send({ error: 'Brain connection failed', details: error.message });
    }
  });
}

module.exports = agentsRoutes;
