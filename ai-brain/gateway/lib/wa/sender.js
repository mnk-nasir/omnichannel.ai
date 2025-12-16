'use strict';
/**
 * lib/wa/sender.js
 * Message delivery — sends a WhatsApp reply via the connected client.
 */
const state = require('./state');

const log = (level, msg, extra = '') =>
  console.log(`[WhatsApp][${level.toUpperCase()}] ${new Date().toISOString()} ${msg}${extra ? ' | ' + JSON.stringify(extra) : ''}`);

/**
 * Sends a text message to a WhatsApp user.
 * @param {string} toPhone - Recipient phone number
 * @param {string} textMsg - Message text
 * @param {string|null} chatId - Exact WA chat ID (e.g. 1234@c.us); falls back to derived ID
 * @returns {boolean} true on success
 */
async function sendWhatsAppMessage(toPhone, textMsg, chatId = null) {
  const client = state.getClient();
  if (!client || !state.isConnected()) {
    throw new Error(`WhatsApp Client not connected. State: ${state.getState()}`);
  }

  const resolvedChatId = chatId || `${toPhone.replace(/\D/g, '')}@c.us`;

  try {
    log('info', `Sending reply via chatId: ${resolvedChatId}`);
    const chat = await client.getChatById(resolvedChatId);
    await chat.sendMessage(textMsg);
    log('info', `✅ Reply sent to ${toPhone} (chatId: ${resolvedChatId})`);
    return true;
  } catch (err) {
    log('error', `Failed to send message to ${toPhone}`, {
      chatId: resolvedChatId,
      message: err.message
    });
    return false;
  }
}

module.exports = { sendWhatsAppMessage };
