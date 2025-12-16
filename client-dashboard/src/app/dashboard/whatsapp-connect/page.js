"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, Loader2, RefreshCw, Smartphone, MonitorSmartphone, Wifi, WifiOff, AlertCircle, MessageSquare, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const S = {
  card: { background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' },
  step: { display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px 0' }
};

export default function WhatsAppConnectPage() {
  const [status, setStatus] = useState({ isConnected: false, qrCode: null });
  const [phase, setPhase] = useState('loading'); // loading | qr | connected | error
  const [countdown, setCountdown] = useState(30);
  const pollingRef = useRef(null);
  const countdownRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      if (!res.ok) throw new Error('Gateway error');
      const data = await res.json();
      if (!mountedRef.current) return;
      setStatus(data);
      if (data.isConnected) {
        setPhase('connected');
        clearInterval(pollingRef.current);
        clearInterval(countdownRef.current);
      } else if (data.qrCode) {
        if (data.state === 'authenticating') setPhase('authenticating');
        else { setPhase('qr'); setCountdown(30); }
      } else if (data.state === 'authenticating') setPhase('authenticating');
      else if (data.lastError) setPhase('error');
      else setPhase('loading');
    } catch { if (mountedRef.current) setPhase('error'); }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetch('/api/whatsapp/start', { method: 'POST' }).catch(() => {});
    fetchStatus();
    pollingRef.current = setInterval(fetchStatus, 3000);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => prev <= 1 ? 30 : prev - 1);
    }, 1000);
    return () => {
      mountedRef.current = false;
      clearInterval(pollingRef.current);
      clearInterval(countdownRef.current);
    };
  }, [fetchStatus]);

  const handleRestart = async () => {
    setPhase('loading');
    setStatus({ isConnected: false, qrCode: null });
    await fetch('/api/whatsapp/logout', { method: 'POST' }).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));
    await fetch('/api/whatsapp/start', { method: 'POST' }).catch(() => {});
    fetchStatus();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: '900px' }}>
        
        <div style={S.card}>
          {/* Top Banner */}
          <div style={{ background: 'linear-gradient(90deg, #00E88F, #00c97a)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <MonitorSmartphone size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#000', margin: 0, letterSpacing: '-0.02em' }}>WhatsApp Bridge</h1>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Neural Channel Authentication</p>
              </div>
            </div>
            {status.isConnected && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.1)', padding: '6px 14px', borderRadius: '99px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>Active</span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: phase === 'connected' ? '1fr' : '1.4fr 1fr', minHeight: '440px' }}>
            
            {/* Phase logic */}
            {phase === 'connected' ? (
              <div style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', marginBottom: '32px' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0,232,143,0.1)', border: '2px solid rgba(0,232,143,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={50} color="#00E88F" />
                  </div>
                  <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: '1px solid rgba(0,232,143,0.2)', animation: 'ping 2s infinite' }} />
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.03em' }}>System Linked!</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, marginBottom: '32px' }}>
                  Your AI Agent is now autonomously responding to incoming WhatsApp traffic on your primary business account.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(0,232,143,0.06)', border: '1px solid rgba(0,232,143,0.2)', borderRadius: '16px', color: '#00E88F', fontSize: '13px', fontWeight: 700 }}>
                  <Wifi size={16} /> Operational & Listening
                </div>
                <button onClick={handleRestart} style={{ marginTop: '40px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={12} /> Disconnect Account
                </button>
              </div>
            ) : (
              <>
                {/* LEFT: Instructions */}
                <div style={{ padding: '40px 48px', borderRight: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                    Sync your business account<br />
                    to <span style={{ color: '#00E88F' }}>link the AI brain</span>
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { icon: '1', t: 'Open WhatsApp on your phone' },
                      { icon: '2', t: 'Navigate to Linked Devices', s: 'Tap ⋮ or Settings > Linked Devices' },
                      { icon: '3', t: 'Tap "Link a Device"', s: 'Unlock your phone if prompted' },
                      { icon: '4', t: 'Scan the neural QR code', s: 'Ensure the code is within the frame' },
                    ].map((step, i) => (
                      <div key={i} style={S.step}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,232,143,0.15)', border: '1px solid rgba(0,232,143,0.3)', color: '#00E88F', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                          {step.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{step.t}</div>
                          {step.s && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{step.s}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <ShieldCheck size={14} color="#00E88F" /> E2E Encrypted Authentication
                  </div>
                </div>

                {/* RIGHT: QR Code */}
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)' }}>
                  <AnimatePresence mode="wait">
                    {phase === 'loading' && (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                        <div style={{ width: '200px', height: '200px', borderRadius: '24px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                          <Loader2 size={32} className="animate-spin" color="#00E88F" />
                          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Initializing...</div>
                        </div>
                      </motion.div>
                    )}

                    {phase === 'error' && (
                      <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                        <div style={{ width: '200px', height: '200px', borderRadius: '24px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px' }}>
                          <AlertCircle size={32} color="#ef4444" />
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#ef4444' }}>Gateway Error</div>
                          <div style={{ fontSize: '10px', color: 'rgba(239,68,68,0.6)', lineHeight: 1.4 }}>Verify server connection</div>
                        </div>
                        <button onClick={fetchStatus} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#00E88F', fontSize: '12px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}>Retry Sync</button>
                      </motion.div>
                    )}

                    {phase === 'qr' && status.qrCode && (
                      <motion.div key="qr" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', marginBottom: '24px' }}>
                          <div style={{ width: '210px', height: '210px', background: '#fff', borderRadius: '20px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                            <img src={status.qrCode} alt="Sync QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '32px', height: '32px', background: '#00E88F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, color: '#000', border: '4px solid #131820' }}>
                            {countdown}
                          </div>
                        </div>
                        <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', margin: '0 auto 12px' }}>
                          <div style={{ height: '100%', background: '#00E88F', width: `${(countdown / 30) * 100}%`, transition: 'width 1s linear' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Refreshes in {countdown}s</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Smartphone size={14} color="var(--text-muted)" />
             <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Android & iPhone Compatible</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Zap size={14} color="#00E88F" />
             <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Neural Processing Active</span>
           </div>
        </div>

      </motion.div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes ping { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.4); opacity: 0; } }
      `}</style>
    </div>
  );
}
