"use client";
import { useState, useEffect, useCallback, Fragment } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, BarChart3, Users, RefreshCw, Mic, Activity, Zap, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallLogs } from '@/hooks/useCallLogs';

const S = {
  card: { background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' },
  stat: { padding: '24px', flex: 1 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid transparent' }
};

const fmt = (s) => {
  if (!s && s !== 0) return '—';
  const sec = Math.round(s);
  return sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`;
};
const fmtTime = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const fmtPhone = (p) => p || 'Unknown';

const directionIcon = (call) => {
  if (call.status === 'missed' || call.status === 'no-answer') return <PhoneMissed size={14} color="#f87171" />;
  if (call.type === 'inboundPhoneCall') return <PhoneIncoming size={14} color="#60a5fa" />;
  return <PhoneOutgoing size={14} color="#00E88F" />;
};

const STATUS_MAP = {
  'ended': { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)', border: 'var(--border)' },
  'in-progress': { color: '#00E88F', bg: 'rgba(0,232,143,0.1)', border: 'rgba(0,232,143,0.2)' },
  'queued': { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
  'ringing': { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
  'failed': { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
  'missed': { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
};

const buildHourly = (calls) => {
  const counts = Array(24).fill(0);
  calls.forEach(c => counts[new Date(c.createdAt).getHours()]++);
  return counts;
};

export default function CallLogsPage() {
  const [lastRefresh, setLastRefresh] = useState(null);
  const [activeCalls, setActiveCalls] = useState([]);
  const [expandedCall, setExpandedCall] = useState(null);
  const { calls, loading, fetchCalls } = useCallLogs();

  const refresh = useCallback(async () => {
    await fetchCalls({ limit: 100 });
    try {
      const res = await fetch('/api/vapi/active');
      const data = await res.json();
      setActiveCalls(data.active_calls || []);
    } catch { setActiveCalls([]); }
    setLastRefresh(new Date());
  }, [fetchCalls]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [refresh]);

  const totalCalls  = calls.length;
  const inbound     = calls.filter(c => c.type === 'inboundPhoneCall').length;
  const outbound    = calls.filter(c => c.type !== 'inboundPhoneCall').length;
  const totalSecs   = calls.reduce((a, c) => a + (c.endedAt && c.startedAt ? (new Date(c.endedAt) - new Date(c.startedAt)) / 1000 : 0), 0);
  const avgDuration = totalCalls ? Math.round(totalSecs / totalCalls) : 0;
  const hourly      = buildHourly(calls);
  const maxHour     = Math.max(...hourly, 1);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(0,232,143,0.08)', border: '1px solid rgba(0,232,143,0.2)', borderRadius: '99px', padding: '4px 12px', marginBottom: '12px' }}>
            <Activity size={11} color="#00E88F" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#00E88F', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Live Intelligence</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)', margin: 0 }}>Call Logs & Analytics</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', fontWeight: 500 }}>
            Unified record of all neural conversations. {lastRefresh && <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>Refreshed {lastRefresh.toLocaleTimeString()}</span>}
          </p>
        </motion.div>
        <button onClick={refresh} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      <AnimatePresence>
        {activeCalls.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} style={{ ...S.card, background: 'linear-gradient(135deg, #00E88F, #00c97a)', border: 'none', padding: '20px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 0 40px rgba(0,232,143,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', background: 'rgba(0,0,0,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Mic size={22} className="animate-pulse" />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#000', letterSpacing: '-0.02em' }}>Neural Link Active</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(0,0,0,0.6)' }}>AI is talking right now with {activeCalls[0]?.customer?.number || "a customer"}.</div>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '6px 14px', borderRadius: '99px', fontSize: '11px', fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {activeCalls.length} Channel{activeCalls.length > 1 ? 's' : ''} Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
        {[
          { label: 'Total Calls',  value: totalCalls,       icon: <Phone size={18} />,         color: '#F0F4FA', accent: '#3E4A57' },
          { label: 'Inbound',      value: inbound,           icon: <PhoneIncoming size={18} />, color: '#60a5fa', accent: '#60a5fa' },
          { label: 'Outbound',     value: outbound,          icon: <PhoneOutgoing size={18} />, color: '#00E88F', accent: '#00E88F' },
          { label: 'Avg Duration', value: fmt(avgDuration),  icon: <Clock size={18} />,         color: '#818cf8', accent: '#818cf8' },
        ].map(c => (
          <div key={c.label} style={{ ...S.card, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${c.accent}12`, border: `1px solid ${c.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, padding: '24px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={15} color="#00E88F" /> Velocity Matrix
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100px', padding: '0 4px' }}>
          {hourly.map((count, hour) => (
            <motion.div key={hour} initial={{ height: 0 }} animate={{ height: `${Math.round((count / maxHour) * 100)}%` }} transition={{ delay: hour * 0.02 }}
              style={{ flex: 1, minHeight: count > 0 ? '4px' : '2px', background: count > 0 ? 'linear-gradient(to top, #00E88F, #00E88F88)' : 'rgba(255,255,255,0.03)', borderRadius: '2px 2px 0 0' }}
              title={`${hour}:00 — ${count} calls`} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 4px 0', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
          {['00:00', '06:00', '12:00', '18:00', '23:59'].map(t => <span key={t} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{t}</span>)}
        </div>
      </div>

      <div style={S.card}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
             Call Archive
          </h2>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{calls.length} events logged</span>
        </div>

        {loading && calls.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid rgba(0,232,143,0.2)', borderTopColor: '#00E88F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : calls.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Phone size={42} style={{ margin: '0 auto 16px', color: 'var(--text-muted)', opacity: 0.15 }} />
            <p style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Log is empty</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Conversations will appear here in real-time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {calls.map(call => {
              const dur = call.endedAt && call.startedAt ? (new Date(call.endedAt) - new Date(call.startedAt)) / 1000 : null;
              const isInbound = call.type === 'inboundPhoneCall';
              const phone = call.phone_number || (isInbound ? (call.customer?.number || call.caller?.number || 'Unknown') : (call.customer?.number || call.to || 'Unknown'));
              const isExpanded = expandedCall === call.id;
              const sStyle = STATUS_MAP[call.status] || STATUS_MAP.ended;

              return (
                <Fragment key={call.id}>
                  <div 
                    onClick={() => setExpandedCall(isExpanded ? null : call.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: isExpanded ? 'rgba(0,232,143,0.03)' : 'transparent', transition: 'all 0.2s' }} className="log-row"
                  >
                    <div style={{ width: '36px', display: 'flex', justifyContent: 'center' }}>{directionIcon(call)}</div>
                    <div style={{ flex: 1.2, fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{fmtPhone(phone)}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ ...S.badge, color: sStyle.color, background: sStyle.bg, borderColor: sStyle.border }}>
                        {call.status || '—'}
                      </span>
                    </div>
                    <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{fmtTime(call.createdAt)}</div>
                    <div style={{ flex: 0.8, fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>{fmt(dur || call.duration)}</div>
                    <div style={{ flex: 0.5, fontSize: '11px', color: '#00E88F', fontWeight: 800 }}>{call.cost ? `$${call.cost.toFixed(4)}` : '—'}</div>
                    <ChevronRight size={14} color="var(--text-muted)" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Zap size={12} color="#00E88F" /> Neural Summary
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, minHeight: '80px' }}>
                              {call.summary || "Conversation summary pending analytical processing."}
                            </div>
                            {call.recording_url && (
                              <div style={{ marginTop: '20px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Mic size={12} color="#60a5fa" /> Audio Capture
                                </div>
                                <audio src={call.recording_url} controls style={{ width: '100%', height: '36px', borderRadius: '10px', background: 'transparent' }} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={12} color="#818cf8" /> Full Transcript
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '14px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, height: '220px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }} className="custom-scrollbar">
                              {call.transcript || "Neural text stream not available for this session."}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .log-row:hover { background: rgba(255,255,255,0.02) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
