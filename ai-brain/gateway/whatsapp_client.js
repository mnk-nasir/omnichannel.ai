'use strict';
/**
 * whatsapp_client.js
 *
 * Orchestrates the WhatsApp Web client lifecycle:
 *   - Initialization / reconnection logic
 *   - Event handling (qr, ready, disconnect, messages)
 *   - Queuing inbound messages to Redis for the AI Brain
 *
 * Helpers are split across lib/wa/:
 *   state.js   — mutable client state
 *   session.js — get_or_create_conversation
 *   sender.js  — sendWhatsAppMessage
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const { createRedisClient } = require('./lib/redis');

const state = require('./lib/wa/state');
const { get_or_create_conversation } = require('./lib/wa/session');
const { sendWhatsAppMessage } = require('./lib/wa/sender');

// ── Shared clients ────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || 'placeholder_key'
);
const redis = createRedisClient();

// ── Logging ───────────────────────────────────────────────────────────────────
const log = (level, msg, extra = '') =>
  console.log(`[WhatsApp][${level.toUpperCase()}] ${new Date().toISOString()} ${msg}${extra ? ' | ' + JSON.stringify(extra) : ''}`);

// ── Initialization ────────────────────────────────────────────────────────────
const initWhatsAppClient = () => {
  const currentState = state.getState();
  if (state.getClient() && !['idle', 'error', 'disconnected'].includes(currentState)) {
    log('info', `Client already in state '${currentState}', skipping re-init.`);
    return;
  }

  log('info', 'Initializing whatsapp-web.js client...');
  state.setState('initializing');
  state.setLastError(null);

  // Destroy any stale instance
  const stale = state.getClient();
  if (stale) {
    try { stale.destroy(); } catch (_) {}
    state.setClient(null);
  }

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '/app/.wwebjs_auth' }),
    puppeteer: {
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions'
      ]
    }
  });

  state.setClient(client);
  _registerEvents(client);

  log('info', 'Calling client.initialize()...');
  client.initialize().catch(err => {
    log('error', '❌ initialize() failed', { message: err.message });
    state.setState('error');
    state.setLastError(`Init error: ${err.message}`);
  });
};

// ── Event Registration (internal) ─────────────────────────────────────────────
function _registerEvents(client) {
  client.on('qr', async (qr) => {
    log('info', 'QR received. Generating image...');
    state.setState('qr_ready');
    try {
      state.setQrCode(await qrcode.toDataURL(qr));
      log('info', 'QR image ready. Waiting for scan...');
    } catch (err) {
      log('error', 'QR generation failed', { message: err.message });
      state.setLastError(`QR Error: ${err.message}`);
    }
  });

  client.on('loading_screen', (percent, message) => {
    log('info', `Loading: ${percent}% — ${message}`);
    state.setState('authenticating');
  });

  client.on('authenticated', () => {
    log('info', '✅ Authenticated.');
    state.setState('authenticating');
    state.setQrCode(null);
  });

  client.on('ready', () => {
    log('info', '🟢 Client READY. AI Agent listening.');
    state.setConnected(true);
    state.setState('ready');
    state.setQrCode(null);
    state.setLastError(null);
    state.setBotStartTime(Date.now());
  });

  client.on('auth_failure', (msg) => {
    log('error', '❌ Auth failure', { reason: msg });
    state.setConnected(false);
    state.setState('error');
    state.setLastError(`Auth failure: ${msg}`);
    state.setQrCode(null);
    try { client.destroy(); } catch (_) {}
    state.setClient(null);
    log('info', 'Auto-restarting in 5s...');
    setTimeout(initWhatsAppClient, 5000);
  });

  client.on('disconnected', (reason) => {
    log('warn', `⚠️ Disconnected: ${reason}`);
    state.setConnected(false);
    state.setState('disconnected');
    state.setLastError(`Disconnected: ${reason}`);
    state.setQrCode(null);
    try { client.destroy(); } catch (_) {}
    state.setClient(null);
    log('info', 'Auto-restarting in 5s...');
    setTimeout(initWhatsAppClient, 5000);
  });

  client.on('remote_session_saved', () => {
    log('info', '📁 Session saved (LocalAuth).');
  });

  client.on('message', (msg) => _handleIncomingMessage(msg));
}

// ── Inbound Message Handler ───────────────────────────────────────────────────
async function _handleIncomingMessage(msg) {
  // Guard: skip broadcasts
  if (msg.from === 'status@broadcast' || msg.from?.includes('broadcast')) return;

  // Guard: skip messages before bot started (prevents replaying history)
  const startTime = state.getBotStartTime();
  if (startTime && (msg.timestamp || 0) * 1000 < startTime) return;

  // Guard: skip empty/media messages
  const text = msg.body?.trim();
  if (!text) return;

  const senderPhone = msg.from.split('@')[0];
  const businessId = '00000000-0000-4000-8000-000000000001';

  log('info', `📩 NEW message from ${senderPhone}: "${text}"`);

  try {
    const conv = await get_or_create_conversation(supabase, msg.from, senderPhone, businessId);
    const convId = conv?.id || null;

    if (convId) {
      await supabase.from('messages').insert([{
        business_id: businessId,
        conversation_id: convId,
        sender: 'customer',
        message: text,
        user_phone: senderPhone
      }]);

      await supabase.from('conversations')
        .update({ last_message: text, updated_at: new Date().toISOString() })
        .eq('id', convId);
    }

    await redis.lpush('incoming_messages', JSON.stringify({
      id: `wa-${msg.id?.id || Date.now()}`,
      source: 'whatsapp',
      business_id: businessId,
      user_phone: senderPhone,
      chat_id: msg.from,
      conversation_id: convId,
      message: text,
      timestamp: new Date().toISOString()
    }));

    log('info', `✅ Queued message from ${senderPhone}`);
  } catch (err) {
    log('error', 'Error processing incoming message', { message: err.message });
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
const logoutWhatsApp = async () => {
  log('info', 'Logout requested.');
  const client = state.getClient();
  if (client) {
    try { await client.logout(); } catch (_) {}
    try { client.destroy(); } catch (_) {}
    state.setClient(null);
  }
  state.reset();
  log('info', 'Logged out. Re-initializing in 2s...');
  setTimeout(initWhatsAppClient, 2000);
};

module.exports = {
  initWhatsAppClient,
  sendWhatsAppMessage,
  getWhatsAppStatus: state.getStatus,
  logoutWhatsApp,
  get_or_create_conversation
};
