'use strict';
/**
 * lib/wa/state.js
 * Centralised mutable state for the WhatsApp client.
 * Exporting getters/setters keeps the state encapsulated.
 */

let _client = null;
let _qrCode = null;
let _isConnected = false;
let _lastError = null;
let _state = 'idle'; // idle | initializing | qr_ready | authenticating | ready | error | disconnected
let _botStartTime = null;

module.exports = {
  getClient: () => _client,
  setClient: (c) => { _client = c; },

  getQrCode: () => _qrCode,
  setQrCode: (q) => { _qrCode = q; },

  isConnected: () => _isConnected,
  setConnected: (v) => { _isConnected = v; },

  getLastError: () => _lastError,
  setLastError: (e) => { _lastError = e; },

  getState: () => _state,
  setState: (s) => { _state = s; },

  getBotStartTime: () => _botStartTime,
  setBotStartTime: (t) => { _botStartTime = t; },

  reset: () => {
    _qrCode = null;
    _isConnected = false;
    _lastError = null;
    _state = 'idle';
  },

  getStatus: () => ({
    isConnected: _isConnected,
    qrCode: _qrCode,
    state: _state,
    lastError: _lastError
  })
};
