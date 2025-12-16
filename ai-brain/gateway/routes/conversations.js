'use strict';

/**
 * routes/conversations.js
 * Inbox management: list conversations, update status/priority,
 * toggle AI pause for human handoff.
 */
async function conversationRoutes(fastify) {
  const { supabase, redis } = fastify;

  // ── List Conversations ──
  fastify.get('/api/conversations', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { business_id } = request.user;
    const { status = 'open', channel } = request.query;

    let query = supabase
      .from('conversations')
      .select('*')
      .eq('business_id', business_id)
      .order('updated_at', { ascending: false });

    if (status !== 'all') query = query.eq('status', status);
    if (channel) query = query.eq('channel', channel);

    const { data, error } = await query;
    if (error) return reply.code(500).send({ error: error.message });
    return reply.send(data);
  });

  // ── Update Conversation (resolve, assign, priority) ──
  fastify.patch('/api/conversations/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { business_id } = request.user;
    const { id } = request.params;
    const { status, priority, assigned_agent } = request.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assigned_agent) updateData.assigned_agent = assigned_agent;

    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .eq('business_id', business_id)
      .select();

    if (error) return reply.code(500).send({ error: error.message });
    return reply.send(data[0]);
  });

  // ── Toggle AI Pause (Human Handoff) ──
  fastify.post('/api/agent/pause', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { business_id } = request.user;
      const { user_phone, paused } = request.body;

      if (paused) {
        await redis.set(`ai_paused:${user_phone}:${business_id}`, 'true', 'EX', 3600);
      } else {
        await redis.del(`ai_paused:${user_phone}:${business_id}`);
      }

      fastify.log.info(`AI paused=${paused} for ${user_phone}`);
      return reply.code(200).send({ status: 'success', paused });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to toggle AI state' });
    }
  });
}

module.exports = conversationRoutes;
