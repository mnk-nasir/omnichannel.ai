'use strict';

/**
 * routes/whatsapp.js
 * WhatsApp status, send, and broadcast campaign routes.
 */
const { manualReplySchema, waCampaignSchema } = require('../lib/validation');
const { initWhatsAppClient, getWhatsAppStatus, logoutWhatsApp, sendWhatsAppMessage, get_or_create_conversation } = require('../whatsapp_client');

async function whatsappRoutes(fastify) {
  const { supabase } = fastify;

  // ── Meta Webhook Verification ──
  fastify.get('/api/webhooks/whatsapp', async (request, reply) => {
    const verify_token = process.env.META_VERIFY_TOKEN || 'omnichannel_secret_token';
    const mode = request.query['hub.mode'];
    const token = request.query['hub.verify_token'];
    const challenge = request.query['hub.challenge'];

    if (mode === 'subscribe' && token === verify_token) {
      fastify.log.info('WEBHOOK_VERIFIED');
      return reply.code(200).send(challenge);
    }
    return reply.code(403).send('Forbidden');
  });

  // ── WhatsApp Web Status ──
  fastify.get('/api/whatsapp/status', async (request, reply) => {
    return reply.send(getWhatsAppStatus());
  });

  // ── Debug Endpoint ──
  fastify.get('/api/whatsapp/debug', async (request, reply) => {
    const status = getWhatsAppStatus();
    return reply.send({
      ...status,
      hasQrCode: !!status.qrCode,
      timestamp: new Date().toISOString(),
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL ? '✅ set' : '❌ missing',
        SUPABASE_KEY: process.env.SUPABASE_KEY ? '✅ set' : '❌ missing',
        REDIS_HOST: process.env.REDIS_HOST || 'redis (default)',
        NODE_ENV: process.env.NODE_ENV || 'not set',
      }
    });
  });

  // ── Start / Restart WhatsApp Client ──
  fastify.post('/api/whatsapp/start', async (request, reply) => {
    initWhatsAppClient();
    return reply.send({ success: true, message: 'Initialization triggered' });
  });

  // ── Logout WhatsApp Client ──
  fastify.post('/api/whatsapp/logout', async (request, reply) => {
    await logoutWhatsApp();
    return reply.send({ success: true, message: 'Logged out and restarting' });
  });

  // ── Send Message (called by Brain Consumer or Dashboard Human Reply) ──
  fastify.post('/api/messages/send', async (request, reply) => {
    const validation = manualReplySchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: validation.error.format() });
    }

    const { to, message, source, business_id, sender, chat_id } = validation.data;
    fastify.log.info({ to, source, sender }, 'API: send message request');

    try {
      if (source === 'whatsapp') {
        const success = await sendWhatsAppMessage(to, message, chat_id || null);
        if (!success) return reply.code(500).send({ success: false, error: 'WhatsApp send failed' });

        const conversation = await get_or_create_conversation(supabase, chat_id || to, to, business_id);
        await supabase.from('messages').insert([{
          business_id: business_id || '00000000-0000-4000-8000-000000000001',
          user_phone: to,
          sender: sender || 'ai',
          message,
          conversation_id: conversation?.id || undefined
        }]).catch(err => fastify.log.warn('Supabase AI reply log error: ' + err.message));

        return reply.send({ success: true });
      } else {
        const { error } = await supabase.from('messages').insert([{
          business_id: business_id || 'demo_company',
          user_phone: to,
          sender: sender || 'ai',
          message,
          conversation_id: validation.data.conversation_id || undefined
        }]);
        if (error) throw new Error(error.message);
        return reply.send({ success: true });
      }
    } catch (err) {
      fastify.log.error({ err: err.message }, 'Send message error');
      return reply.code(500).send({ success: false, error: err.message });
    }
  });

  // ── WhatsApp Broadcast Campaign ──
  fastify.post('/api/campaigns/send', async (request, reply) => {
    const validation = waCampaignSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: validation.error.format() });
    }
    const { contacts: rawContacts, message, business_id, delay: delay_ms, tag } = validation.data;

    let contactsToMessage = rawContacts || [];
    if (tag || !rawContacts) {
      let query = supabase.from('contacts').select('phone, name').eq('business_id', business_id);
      if (tag && tag !== 'all') query = query.contains('tags', [tag]);
      const { data: dbContacts } = await query;
      if (dbContacts) contactsToMessage = dbContacts;
    }

    if (!contactsToMessage.length) {
      return reply.code(400).send({ error: 'No contacts found to message' });
    }

    const campaignId = `campaign_${Date.now()}`;
    fastify.log.info({ campaignId, total: contactsToMessage.length }, '📣 Starting WhatsApp campaign');

    // Fire-and-forget background loop
    (async () => {
      for (const [i, contact] of contactsToMessage.entries()) {
        const phone = (contact.phone || contact || '').toString().replace(/\D/g, '');
        if (!phone) continue;
        try {
          const success = await sendWhatsAppMessage(phone, message, null);
          fastify.log.info({ campaignId, phone, status: success ? '✅ sent' : '❌ failed' }, 'Campaign message');
          await supabase.from('campaign_logs').insert([{
            campaign_id: campaignId,
            business_id: business_id || '00000000-0000-4000-8000-000000000001',
            phone,
            message,
            status: success ? 'sent' : 'failed'
          }]).catch(() => {});
        } catch (err) {
          fastify.log.error({ phone, err: err.message }, 'Campaign send error');
        }
        if (i < contactsToMessage.length - 1) {
          await new Promise(r => setTimeout(r, delay_ms));
        }
      }
      fastify.log.info({ campaignId }, '📣 Campaign completed');
    })();

    return reply.send({
      success: true,
      campaign_id: campaignId,
      total: contactsToMessage.length,
      message: `Campaign started. Sending to ${contactsToMessage.length} contacts.`
    });
  });
}

module.exports = whatsappRoutes;
