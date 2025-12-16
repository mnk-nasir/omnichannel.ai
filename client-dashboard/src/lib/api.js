/**
 * lib/api.js
 * Centralised API client for all dashboard pages.
 *
 * Every gateway URL, retry logic, and error normalisation lives here.
 * Pages/hooks call these functions instead of raw fetch().
 */

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || '';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const res = await fetch(`${GATEWAY}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${body}`);
  }

  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

const get = (path, q = {}) => {
  const qs = Object.keys(q).length ? '?' + new URLSearchParams(q).toString() : '';
  return request(`${path}${qs}`);
};

const post = (path, body) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });

const patch = (path, body) =>
  request(path, { method: 'PATCH', body: JSON.stringify(body) });

const del = (path) =>
  request(path, { method: 'DELETE' });

// ── Agents ────────────────────────────────────────────────────────────────────
export const agentsApi = {
  list:   (businessId) => get('/api/agents', { business_id: businessId }),
  create: (data)       => post('/api/agents', data),
  update: (id, data)   => patch(`/api/agents?id=${id}`, data),
  remove: (id)         => del(`/api/agents?id=${id}`)
};

// ── Conversations / Inbox ─────────────────────────────────────────────────────
export const conversationsApi = {
  list:   (params) => get('/api/conversations', params),
  update: (id, data) => patch(`/api/conversations/${id}`, data),
  pauseAI:(phone, businessId, paused) =>
    post('/api/agent/pause', { user_phone: phone, business_id: businessId, paused })
};

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const campaignsApi = {
  sendWhatsapp: (data) => post('/api/campaigns/send', data),
  sendVoice:    (data) => post('/api/voice/campaign', data)
};

// ── VAPI / Voice ──────────────────────────────────────────────────────────────
export const voiceApi = {
  call:       (data)   => post('/api/vapi/call', data),
  listCalls:  (params) => get('/api/vapi/calls', params),
  getCall:    (id)     => get(`/api/vapi/call/${id}`)
};

// ── WhatsApp ──────────────────────────────────────────────────────────────────
export const whatsappApi = {
  status:     ()  => get('/api/whatsapp/status'),
  start:      ()  => post('/api/whatsapp/start', {}),
  logout:     ()  => post('/api/whatsapp/logout', {}),
  sendMessage:(data) => post('/api/messages/send', data)
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesApi = {
  list: (conversationId) => get('/api/conversations/messages', { conversation_id: conversationId })
};
