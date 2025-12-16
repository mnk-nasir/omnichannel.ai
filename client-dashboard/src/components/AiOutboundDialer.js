"use client";
import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Loader2, Mic, Clock, XCircle, User, MessageSquare, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { useBusinessContext } from '@/context/BusinessContext';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  idle: { color: 'rgba(255,255,255,0.04)', label: 'Ready for Dispatch', pulse: false },
  calling: { color: 'rgba(59,130,246,0.1)', label: 'Neural Link Initiated', pulse: true },
  ringing: { color: 'rgba(251,191,36,0.1)', label: '📳 Target Ringing...', pulse: true },
  'in-progress': { color: 'rgba(0,232,143,0.1)', label: '🟢 AI Active Voice', pulse: true },
  ended: { color: 'rgba(255,255,255,0.04)', label: '✅ Session Concluded', pulse: false },
  error: { color: 'rgba(239,68,68,0.1)', label: '❌ Connection Failed', pulse: false },
};

const LANGUAGES = [
  { code: 'multi', name: 'Auto-Detect (Multi)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'en', name: 'English' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'es', name: 'Spanish' },
];

export default function AiOutboundDialer() {
  const { businessId } = useBusinessContext();
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState('idle');
  const [callId, setCallId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  // New States
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('multi');
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  const pollRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchAgents();
  }, [businessId]);

  const fetchAgents = async () => {
    if (!businessId) return;
    setIsLoadingAgents(true);
    try {
      const res = await fetch(`/api/agents?business_id=${businessId}`);
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
      if (data.length > 0) setSelectedAgentId(data[0].id);
    } catch (err) {
      console.error("Failed to fetch agents", err);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  useEffect(() => {
    if (callId && ['calling', 'ringing', 'in-progress'].includes(status)) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/vapi/call/${callId}`);
          const data = await res.json();
          const s = data.status || 'ended';
          setStatus(s);
          if (s === 'ended' || s === 'failed') {
            clearInterval(pollRef.current);
            clearInterval(timerRef.current);
          }
        } catch (_) { }
      }, 2000);
    }
    return () => clearInterval(pollRef.current);
  }, [callId, status]);

  useEffect(() => {
    if (status === 'in-progress') {
      setCallDuration(0);
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleCall = async () => {
    if (!number.trim() || isActive) return;
    let dialNumber = number.replace(/[\s\-().]/g, '');
    if (!dialNumber.startsWith('+')) dialNumber = '+' + dialNumber;
    dialNumber = dialNumber.replace(/^\+0+/, '+');

    setStatus('calling'); setErrorMsg(''); setCallId(null); setCallDuration(0);

    const effectiveBusinessId = businessId || "00000000-0000-4000-8000-000000000001";

    try {
      const res = await fetch('/api/vapi/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: dialNumber,
          business_id: effectiveBusinessId,
          agent_id: selectedAgentId,
          first_message: firstMessage || undefined,
          language: selectedLanguage
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setStatus('error'); setErrorMsg(data.error || 'Call failed'); return; }
      setCallId(data.call_id);
      setStatus(data.status || 'ringing');
    } catch (err) {
      setStatus('error'); setErrorMsg('Could not reach Gateway. Check server connection.');
    }
  };

  const handleHangup = () => {
    setStatus('ended');
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
    setCallId(null);
  };

  const isActive = ['calling', 'ringing', 'in-progress'].includes(status);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #00E88F, #00c97a)', padding: '24px', textAlign: 'center', color: '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
          <Phone size={20} />
          <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Neural Outbound</h2>
        </div>
        <p style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, margin: 0 }}>Initiate high-fidelity voice session</p>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Step 1: Agent & Config */}
        {!isActive && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <User size={10} style={{ display: 'inline', marginRight: '4px' }} /> Specialist Agent
              </label>
              <select
                value={selectedAgentId}
                onChange={e => setSelectedAgentId(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
              >
                {isLoadingAgents ? <option>Loading...</option> : agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Globe size={10} style={{ display: 'inline', marginRight: '4px' }} /> Link Language
              </label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
          </motion.div>
        )}

        {/* Step 2: First Script */}
        {!isActive && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              <MessageSquare size={10} style={{ display: 'inline', marginRight: '4px' }} /> Custom Greeting (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Hello, this is Sarah calling regarding your request..."
              value={firstMessage}
              onChange={e => setFirstMessage(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
            />
          </motion.div>
        )}

        {/* Number Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px', textAlign: 'center' }}>
            Target Destination
          </label>
          <input
            type="tel"
            value={number}
            onChange={e => setNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCall()}
            placeholder="+919876543210"
            disabled={isActive}
            style={{ width: '100%', textAlign: 'center', fontSize: '28px', fontWeight: 900, background: 'rgba(255,255,255,0.02)', border: '2px solid var(--border)', borderRadius: '16px', padding: '16px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace', letterSpacing: '0.1em' }}
          />
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px', fontWeight: 600 }}>E.164 Format Required: +[Country][Number]</p>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: cfg.color, border: '1px solid var(--border)' }} className={cfg.pulse ? 'animate-pulse' : ''}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span>
          {status === 'in-progress' && callDuration > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,232,143,0.2)', color: '#00E88F', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 900 }}>
              <Clock size={12} /> {fmt(callDuration)}
            </div>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {status === 'error' && errorMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <XCircle size={16} color="#ef4444" style={{ marginTop: '2px' }} />
              <p style={{ fontSize: '12px', color: '#ef4444', margin: 0, fontWeight: 600 }}>{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        {!isActive ? (
          <button
            onClick={handleCall}
            disabled={!number.trim() || isLoadingAgents}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', background: 'linear-gradient(135deg, #00E88F, #00c97a)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 30px rgba(0,232,143,0.2)' }}
            className="call-btn"
          >
            {isLoadingAgents ? <Loader2 size={20} className="animate-spin" /> : <><Phone size={20} /> Initiate Dispatch</>}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)' }}>
              {status === 'calling' ? <><Loader2 size={16} className="animate-spin" /> Linking...</> : <><Mic size={16} color="#00E88F" className="animate-pulse" /> Neural Active</>}
            </div>
            <button
              onClick={handleHangup}
              style={{ width: '64px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(239,68,68,0.2)' }}
            >
              <PhoneOff size={22} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .call-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .call-btn:active { transform: translateY(0); }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
