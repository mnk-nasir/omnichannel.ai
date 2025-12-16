'use strict';

/**
 * routes/webhooks.js
 * Incoming message webhook handler — Meta (WhatsApp/Instagram/Messenger),
 * and generic Web/Sandbox payloads. Handles CRM provisioning, credit metering,
 * and Redis queue ingestion.
 */
const { incomingMessageSchema } = require('../lib/validation');

async function webhookRoutes(fastify) {
  const { supabase, redis } = fastify;

  fastify.post('/api/webhooks/incoming', async (request, reply) => {
    // Validate sandbox/web direct-post payloads
    if (request.body.source === 'web' || request.body.source === 'sandbox') {
      const validation = incomingMessageSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.code(400).send({ error: 'Invalid payload', details: validation.error.format() });
      }
    }

    try {
      const payload = request.body;
      let queueJob = null;

      // ── 1. Normalise Incoming Message ──

      // Meta WhatsApp
      if (payload.object === 'whatsapp_business_account' && payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const msg = payload.entry[0].changes[0].value.messages[0];
        const contact = payload.entry[0].changes[0].value.contacts?.[0];
        queueJob = {
          id: msg.id,
          source: 'whatsapp',
          business_id: payload.entry[0].id,
          user_phone: contact?.wa_id || msg.from,
          user_name: contact?.profile?.name || 'User',
          message: msg.text?.body || '[Non-text message]',
          timestamp: new Date(msg.timestamp * 1000).toISOString()
        };
      }
      // Instagram / Facebook Messenger
      else if ((payload.object === 'instagram' || payload.object === 'page') && payload.entry?.[0]?.messaging?.[0]) {
        const fbMsg = payload.entry[0].messaging[0];
        if (fbMsg.message && !fbMsg.message.is_echo) {
          queueJob = {
            id: fbMsg.message?.mid || Date.now().toString(),
            source: payload.object === 'instagram' ? 'instagram' : 'messenger',
            business_id: payload.entry[0].id,
            user_phone: fbMsg.sender.id,
            user_name: 'Social User',
            message: fbMsg.message?.text || '[Non-text message]',
            timestamp: new Date(fbMsg.timestamp).toISOString()
          };
        }
      }
      // Generic / Web Sandbox
      else if (payload.message) {
        queueJob = {
          id: Date.now().toString(),
          source: payload.source || 'web',
          business_id: payload.business_id || '00000000-0000-4000-8000-000000000001',
          user_phone: payload.user_phone || 'anonymous',
          message: payload.message,
          timestamp: new Date().toISOString()
        };
      }

      if (!queueJob) return reply.code(200).send({ status: 'ignored' });

      // ── 2. Credit Metering ──
      try {
        const { error: creditError } = await supabase.rpc('deduct_business_credits', {
          p_business_id: queueJob.business_id,
          p_type: 'ai_conversation',
          p_amount: 1,
          p_metadata: { source: queueJob.source, user: queueJob.user_phone }
        });
        if (creditError && queueJob.business_id !== '00000000-0000-4000-8000-000000000001') {
          fastify.log.warn(`Billing Block: ${queueJob.business_id} — ${creditError.message}`);
          return reply.code(402).send({ error: 'insufficient_credits' });
        }
      } catch (e) {
        if (queueJob.business_id !== '00000000-0000-4000-8000-000000000001') throw e;
        fastify.log.warn('Bypassing credit check for demo business');
      }

      // ── 3. CRM Provisioning ──
      let conversation_id = null;
      try {
        const { data: convId, error: crmError } = await supabase.rpc('get_or_create_conversation', {
          p_business_id: queueJob.business_id,
          p_phone: queueJob.user_phone,
          p_name: queueJob.user_name || 'User'
        });
        if (crmError) fastify.log.error('CRM RPC Error: ' + crmError.message);
        if (convId) conversation_id = convId;
      } catch (e) {
        fastify.log.warn('CRM provisioning failed: ' + e.message);
      }

      // ── 4. Persist Incoming Message ──
      const { error: dbError } = await supabase.from('messages').insert({
        business_id: queueJob.business_id,
        user_phone: queueJob.user_phone,
        sender: 'customer',
        message: queueJob.message,
        conversation_id
      });
      if (dbError) fastify.log.error('Supabase message log error: ' + dbError.message);

      // ── 5. Human Handoff Check ──
      queueJob.conversation_id = conversation_id;
      const isPaused = await redis.get(`ai_paused:${queueJob.user_phone}:${queueJob.business_id}`);
      if (isPaused === 'true') {
        fastify.log.info(`AI paused for ${queueJob.user_phone}. Skipping queue.`);
        return reply.code(200).send({ status: 'human_handling' });
      }

      // ── 6. Enqueue for Brain ──
      await redis.lpush('incoming_messages', JSON.stringify(queueJob));
      fastify.log.info(`Queued message ID ${queueJob.id} from ${queueJob.source}`);
      return reply.code(200).send({ status: 'queued', id: queueJob.id });

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}

module.exports = webhookRoutes;
