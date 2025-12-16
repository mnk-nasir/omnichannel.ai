'use strict';

/**
 * routes/voice.js
 * VAPI custom-LLM proxy, outbound call initiation, campaign, and status routes.
 */
const { vapiCallSchema, waCampaignSchema } = require('../lib/validation');

const getBrainUrl = () => (process.env.BRAIN_URL || 'http://127.0.0.1:8000').trim();

/**
 * Fetches the active agent persona from the Brain for a given business.
 * Returns { agentName, systemPrompt, agentId }.
 */
async function resolveAgentPersona(businessId, log, preferredAgentId = null) {
  const brainUrl = getBrainUrl();
  const defaultPersona = {
    agentName: 'AI Assistant',
    systemPrompt: 'You are a professional AI assistant. Keep responses extremely short, fast, and conversational. Speak only in English.',
    agentId: null
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${brainUrl}/api/agents?business_id=${businessId}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      log.warn({ status: res.status }, '🧠 Brain persona fetch failed — using default');
      return defaultPersona;
    }

    const agents = await res.json();

    // Resolve logic:
    // 1. If preferredAgentId is passed, find it specifically
    // 2. Otherwise, find the FIRST active agent
    // 3. Last fallback: use the first agent record found
    let active = null;
    if (preferredAgentId) {
      active = agents.find(a => a.id === preferredAgentId);
    }

    if (!active) {
      active = agents.find(a => a.status === 'active') || agents[0];
    }

    if (!active) return defaultPersona;

    log.info({ agentName: active.name, agentId: active.id }, '🧠 Persona resolved from Brain');
    return { agentName: active.name, systemPrompt: active.system_prompt, agentId: active.id };
  } catch (err) {
    log.warn({ err: err.message }, '🧠 Brain persona fetch error — using default');
    return defaultPersona;
  }
}

async function voiceRoutes(fastify) {
  const vapiKey = process.env.VAPI_API_KEY;
  const http    = require('http');
  const proxyAgent = new http.Agent({ keepAlive: true, maxSockets: 1000 });

  // Per-call state
  const debounceTimers    = new Map(); // callId → setTimeout handle
  const activeRequests    = new Map(); // callId → http.ClientRequest
  const processingLock    = new Map(); // callId → boolean
  const lastProcessedText = new Map(); // callId → string

  function cleanupCall(callId) {
    clearTimeout(debounceTimers.get(callId));
    debounceTimers.delete(callId);
    activeRequests.delete(callId);
    processingLock.delete(callId);
    lastProcessedText.delete(callId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────────────────────────

  // Write SSE headers to the raw socket (safe to call multiple times)
  function writeSseHeaders(raw) {
    if (!raw.headersSent) {
      raw.writeHead(200, {
        'Content-Type':    'text/event-stream; charset=utf-8',
        'Cache-Control':   'no-cache, no-transform',
        'Connection':      'keep-alive',
        'X-Accel-Buffering': 'no'
      });
    }
  }

  // Always close the VAPI stream cleanly — empty body or hanging = llm-failed
  function closeSse(raw, content) {
    try {
      writeSseHeaders(raw);
      if (!raw.writableEnded) {
        if (content) {
          const chunk = JSON.stringify({
            id: `chatcmpl-skip-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: 'llama-3.1-8b-instant',
            choices: [{ index: 0, delta: { content }, finish_reason: null }]
          });
          raw.write(`data: ${chunk}\n\n`);
        }
        raw.write('data: [DONE]\n\n');
        raw.end();
      }
    } catch (_) {}
  }

  // Always close a non-stream response through raw socket
  function closeJson(raw, body) {
    try {
      if (!raw.headersSent) {
        const json = JSON.stringify(body);
        raw.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(json)
        });
        raw.end(json);
      }
    } catch (_) {}
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CORE PROXY: forward request to Brain
  // ────────────────────────────────────────────────────────────────────────────
  function forwardToBrain(callId, body, isStream, raw) {
    const messages    = body.messages || [];
    const currentText = messages[messages.length - 1]?.content || '';

    // 1. DEDUP: same text already in-flight → close stream cleanly
    if (currentText && lastProcessedText.get(callId) === currentText) {
      fastify.log.warn(`[DEDUP] Duplicate text skipped for call ${callId}`);
      if (isStream) closeSse(raw);
      else closeJson(raw, { choices: [{ message: { role: 'assistant', content: '' }, finish_reason: 'stop' }] });
      return;
    }
    lastProcessedText.set(callId, currentText);

    // 2. PREEMPT: kill any in-flight Brain request for this call
    const prev = activeRequests.get(callId);
    if (prev) {
      try { prev.destroy(); } catch (_) {}
      activeRequests.delete(callId);
      processingLock.set(callId, false); // CRITICAL: Reset lock so new request can start
      fastify.log.warn(`[PREEMPT] Killed and Reset lock for call ${callId}`);
    }

    // 3. LOCK: only one active inference per call (Double check)
    if (processingLock.get(callId)) {
      fastify.log.warn(`[LOCK] Still busy — skipping for call ${callId}`);
      if (isStream) closeSse(raw);
      else closeJson(raw, { choices: [{ message: { role: 'assistant', content: '' }, finish_reason: 'stop' }] });
      return;
    }
    processingLock.set(callId, true);
    fastify.log.info(`[VOICE_PROXY] → Brain | call=${callId} | text='${currentText.substring(0, 60)}'`);

    const bodyStr = JSON.stringify(body);
    const brainUrlStr = getBrainUrl();
    const brainUrl = new URL(brainUrlStr);

    fastify.log.info(`[VOICE_PROXY] 📡 Sending to Brain: ${brainUrl.origin}${brainUrl.pathname}`);

    const brainOptions = {
      hostname: brainUrl.hostname,
      port: brainUrl.port || (brainUrl.protocol === 'https:' ? 443 : 80),
      path: '/api/voice/vapi/chat/completions',
      method: 'POST',
      agent: proxyAgent,
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || ''}`
      },
      timeout: 30000 
    };

    const brainReq = http.request(brainOptions, (brainRes) => {
      processingLock.set(callId, false);
      activeRequests.delete(callId);
      fastify.log.info(`[VOICE_PROXY] ← Brain HTTP ${brainRes.statusCode}`);

      if (brainRes.statusCode !== 200) {
        let errBody = '';
        brainRes.on('data', (d) => errBody += d);
        brainRes.on('end', () => {
          fastify.log.error(`[VOICE_PROXY] ❌ Brain ${brainRes.statusCode}: ${errBody.substring(0, 200)}`);
          if (isStream) closeSse(raw, 'I had a brief issue, please continue.');
          else closeJson(raw, { choices: [{ message: { role: 'assistant', content: 'Please try again.' }, finish_reason: 'stop' }] });
        });
        return;
      }

      // Success: stream Brain response directly to VAPI
      if (isStream) {
        writeSseHeaders(raw);
        brainRes.pipe(raw);
        brainRes.on('error', (err) => {
          fastify.log.error(`[VOICE_PROXY] ❌ Brain stream error: ${err.message}`);
          if (!raw.writableEnded) closeSse(raw, 'I had a brief connection issue, please continue.');
        });
        raw.on('close', () => { try { brainRes.destroy(); } catch (_) {} });
      } else {
        // Non-stream: collect and forward JSON
        let data = '';
        brainRes.on('data', (d) => data += d);
        brainRes.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            closeJson(raw, parsed);
          } catch (_) {
            closeJson(raw, { choices: [{ message: { role: 'assistant', content: data }, finish_reason: 'stop' }] });
          }
        });
      }
    });

    brainReq.on('timeout', () => {
      fastify.log.error(`[VOICE_PROXY] ❌ Brain timeout for call ${callId}`);
      brainReq.destroy();
      processingLock.set(callId, false);
      activeRequests.delete(callId);
      if (isStream) closeSse(raw, 'I need a moment, please go ahead.');
      else closeJson(raw, { choices: [{ message: { role: 'assistant', content: 'Timeout.' }, finish_reason: 'stop' }] });
    });

    brainReq.on('error', (err) => {
      processingLock.set(callId, false);
      activeRequests.delete(callId);
      fastify.log.error(`[VOICE_PROXY] ❌ Brain unreachable: ${err.message}`);
      if (isStream) closeSse(raw, 'I am having a brief connection issue.');
      else closeJson(raw, { choices: [{ message: { role: 'assistant', content: 'Connection issue.' }, finish_reason: 'stop' }] });
    });

    activeRequests.set(callId, brainReq);
    brainReq.write(bodyStr);
    brainReq.end();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // VAPI CUSTOM-LLM PROXY
  // reply.hijack() → we own the raw socket; Fastify must not touch it.
  // All responses go through reply.raw (Node.js ServerResponse) directly.
  // ────────────────────────────────────────────────────────────────────────────
  fastify.post('/api/voice/vapi/chat/completions', (request, reply) => {
    reply.hijack(); // CRITICAL: prevent Fastify from auto-closing the connection

    const raw      = reply.raw;
    const callId   = request.body?.call?.id || 'unknown';
    const isStream = request.body?.stream === true;
    
    // Pass to brain instantly (No Artificial 400ms Delay)
    // Deep copy not strictly necessary since we forward immediately, but good practice
    const bodySnap = JSON.parse(JSON.stringify(request.body));

    fastify.log.info(`[VOICE] Received | call=${callId} | stream=${isStream} | Forwarding instantly`);

    // We no longer debounce. Exact duplicates are handled by lastProcessedText in forwardToBrain.
    forwardToBrain(callId, bodySnap, isStream, raw);
  });

  // ── Outbound Call ──
  fastify.post('/api/vapi/call', async (request, reply) => {
    const validation = vapiCallSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: validation.error.format() });
    }

    const { to, phone, business_id, phone_number_id, agent_id, first_message, language } = validation.data;
    const cleanTo = to || phone;
    const targetBusinessId = business_id || '00000000-0000-4000-8000-000000000001';
    const phoneNumberId = phone_number_id || process.env.VAPI_PHONE_NUMBER_ID;

    if (!cleanTo) return reply.code(400).send({ error: 'to or phone number is required' });
    if (!vapiKey) return reply.code(400).send({ error: 'VAPI_API_KEY not configured' });
    if (!phoneNumberId) return reply.code(400).send({ error: 'VAPI_PHONE_NUMBER_ID not configured' });

    const { agentName, systemPrompt, agentId } = await resolveAgentPersona(targetBusinessId, fastify.log, agent_id);

    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['host'];
    const customLlmUrl = process.env.GATEWAY_PUBLIC_URL
      ? `${process.env.GATEWAY_PUBLIC_URL}/api/voice/vapi/chat/completions`
      : `${protocol}://${host}/api/voice/vapi/chat/completions`;

    const payload = {
      phoneNumberId,
      customer: { number: cleanTo },
      assistant: {
        name: agentName,
        metadata: { business_id: targetBusinessId, agent_id: agentId },
        firstMessage: first_message || `Hello! I am ${agentName}. How can I help you today?`,
        endCallMessage: 'Thank you for calling. Goodbye!',
        transcriber: { provider: 'deepgram', model: 'nova-2', language: language || 'multi' },
        voice: { provider: 'openai', voiceId: 'shimmer' },
        model: { 
          provider: 'custom-llm', 
          url: customLlmUrl, 
          model: 'gpt-4o-mini', 
          temperature: 0.3,
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      }
    };

    fastify.log.info({ agentName, customLlmUrl }, '🛠️ Sending call payload to VAPI');

    try {
      const response = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${vapiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        fastify.log.error({ vapiError: data }, 'VAPI call failed');
        return reply.code(response.status).send({ error: data.message || 'VAPI call failed', details: data });
      }
      fastify.log.info({ callId: data.id }, '📞 Outbound call initiated');
      return reply.send({ success: true, call_id: data.id, status: data.status });
    } catch (err) {
      fastify.log.error({ err: err.message }, 'VAPI call error');
      return reply.code(500).send({ error: err.message });
    }
  });

  // ── Call Status ──
  // Fetches live status from VAPI for in-flight calls
  fastify.get('/api/vapi/call/:callId', async (request, reply) => {
    if (!vapiKey) return reply.code(400).send({ error: 'VAPI_API_KEY not configured' });
    try {
      const response = await fetch(`https://api.vapi.ai/call/${request.params.callId}`, {
        headers: { 'Authorization': `Bearer ${vapiKey}` }
      });
      return reply.send(await response.json());
    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });

  // ── Active Calls ──
  fastify.get('/api/vapi/active', async (request, reply) => {
    if (!vapiKey) return reply.code(400).send({ error: 'VAPI_API_KEY not configured' });
    try {
      const response = await fetch('https://api.vapi.ai/call?status=in-progress', {
        headers: { 'Authorization': `Bearer ${vapiKey}` }
      });
      const calls = await response.json();
      return reply.send({ active_calls: Array.isArray(calls) ? calls : [] });
    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });

  fastify.get('/api/twilio/search', async (req, res) => res.send({ availablePhoneNumbers: [] }));
  fastify.post('/api/twilio/buy', async (req, res) => res.code(400).send({ error: 'Manual provision required' }));


  // ── Voice Campaign ──
  fastify.post('/api/voice/campaign', async (request, reply) => {
    const validation = waCampaignSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send({ error: 'Invalid payload', details: validation.error.format() });
    }
    const { contacts, message: script, business_id, delay: delay_ms } = validation.data;
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

    if (!vapiKey || !phoneNumberId) {
      return reply.code(400).send({ error: 'VAPI_API_KEY or VAPI_PHONE_NUMBER_ID not configured' });
    }
    if (!contacts?.length) {
      return reply.code(400).send({ error: 'contacts array is required' });
    }

    const campaignId = `vapi_camp_${Date.now()}`;
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['host'];
    const customLlmUrl = process.env.GATEWAY_PUBLIC_URL
      ? `${process.env.GATEWAY_PUBLIC_URL}/api/voice/vapi/chat/completions`
      : `${protocol}://${host}/api/voice/vapi/chat/completions`;

    fastify.log.info({ campaignId, total: contacts.length }, '📣 Starting VAPI voice campaign');

    // Fire-and-forget background loop
    (async () => {
      for (const [i, contact] of contacts.entries()) {
        let phone = (contact.phone || contact || '').toString().replace(/[\s\-\(\)\.]/g, '');
        if (!phone) continue;
        if (!phone.startsWith('+')) phone = '+' + phone;

        try {
          const { agentName, systemPrompt, agentId } = await resolveAgentPersona(business_id, fastify.log, validation.data.agent_id);
          const personalizedScript = (script || '').replace(/\{\{\s*name\s*\}\}/gi, contact.name || 'there');

          const payload = {
            phoneNumberId,
            customer: { number: phone, name: contact.name || '' },
            assistant: {
              name: agentName,
              metadata: { business_id, agent_id: agentId },
              firstMessage: personalizedScript || `Hello! I am ${agentName}. How can I assist you today?`,
              transcriber: { provider: 'deepgram', model: 'nova-2', language: 'multi' },
              voice: { provider: 'openai', voiceId: 'shimmer' },
              model: { 
                provider: 'custom-llm', 
                url: customLlmUrl, 
                model: 'gpt-4o-mini', 
                temperature: 0.3,
                headers: {
                  'ngrok-skip-browser-warning': 'true'
                }
              }
            }
          };

          const res = await fetch('https://api.vapi.ai/call/phone', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${vapiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          fastify.log.info({ phone, callId: data.id }, '📞 Campaign call initiated');
        } catch (err) {
          fastify.log.error({ phone, err: err.message }, 'Campaign call failed');
        }

        if (i < contacts.length - 1) {
          await new Promise(r => setTimeout(r, delay_ms));
        }
      }
      fastify.log.info({ campaignId }, '✅ Voice campaign completed');
    })();

    return reply.send({ success: true, campaign_id: campaignId, total: contacts.length });
  });

  // ── VAPI Event Webhooks ──
  fastify.post('/api/webhooks/vapi', async (request, reply) => {
    try {
      const payload = request.body || {};
      const { message } = payload;
      if (!message || !message.type) return reply.send({ status: 'ignored' });

      // Only handle status-update and end-of-call-report
      if (!['status-update', 'end-of-call-report'].includes(message.type)) {
        return reply.send({ status: 'ignored' });
      }

      const call = message.call || {};
      const businessId = call.assistant?.metadata?.business_id || call.assistant?.metadata?.businessId;
      if (!businessId) {
        fastify.log.warn({ callId: call.id }, 'VAPI Webhook: missing business_id in metadata');
        return reply.send({ status: 'skipped' });
      }

      // Upsert call_logs
      // Extract from message for end-of-call, otherwise from call object
      const status = message.type === 'end-of-call-report' ? 'ended' : (call.status || 'unknown');
      const startedAt = message.startedAt || call.startedAt || new Date().toISOString();
      const endedAt = message.endedAt || call.endedAt || null;
      let duration = 0;
      if (startedAt && endedAt) {
        duration = (new Date(endedAt) - new Date(startedAt)) / 1000;
      }

      const transcript = message.transcript || null;
      const summary = message.summary || null;
      const recordingUrl = message.recordingUrl || null;
      const cost = message.cost || call.cost || 0;

      const customerPhone = call.customer?.number || call.customer?.fallbackNumber || 'Unknown';
      const toPhone = call.to || customerPhone; // Can be inbound or outbound

      // Determine correct phone based on direction
      const phoneNumber = call.type === 'inboundPhoneCall'
        ? (call.customer?.number || call.caller?.number || 'Unknown')
        : (call.customer?.number || call.to || 'Unknown');

      const { error } = await fastify.supabase.from('call_logs').upsert({
        vapi_call_id: call.id,
        business_id: businessId,
        type: call.type || 'outboundPhoneCall',
        status: status,
        phone_number: phoneNumber,
        started_at: startedAt,
        ended_at: endedAt,
        duration: duration,
        cost: cost,
        recording_url: recordingUrl,
        transcript: transcript,
        summary: summary,
        updated_at: new Date().toISOString()
      }, { onConflict: 'vapi_call_id' });

      if (error) {
        fastify.log.error({ err: error.message, callId: call.id }, 'VAPI Webhook: failed to upsert call_log');
      } else {
        fastify.log.info({ callId: call.id, type: message.type }, 'VAPI Webhook: call_log recorded');
      }

      return reply.send({ status: 'ok' });
    } catch (err) {
      fastify.log.error({ err: err.message }, 'VAPI Webhook Error');
      return reply.code(500).send({ error: 'Webhook processing failed' });
    }
  });
}

module.exports = voiceRoutes;
