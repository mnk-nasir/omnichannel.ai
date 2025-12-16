"use client";
import { useState, useRef, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";
import {
  Phone, PhoneCall, Upload, Plus, Trash2,
  CheckCircle2, XCircle, Loader2, Clock, Users,
  AlertTriangle, ChevronDown, ChevronUp, Zap, Mic,
  BarChart3, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceCampaign } from "@/hooks/useVoiceCampaign";
import { useBusinessContext } from "@/context/BusinessContext";

const S = {
  card: { background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' },
  input: { width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', transition: 'all 0.2s' },
  label: { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' },
  btn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }
};

const SCRIPTS = [
  { label: "📢 Promotion Call", text: "Hello! This is a call from Demo Company. We have an exclusive offer for you — 20% off on all our services this week only. Press 1 to speak with an agent, or call us back at your convenience. Thank you!" },
  { label: "🔔 Appointment Reminder", text: "Hello! This is a reminder from Demo Company about your upcoming appointment tomorrow. Please call us back to confirm or reschedule. We look forward to seeing you!" },
  { label: "⭐ Feedback Request", text: "Hello! Thank you for being a valued customer of Demo Company. We'd love to hear your feedback. Please call us back or visit our website to leave a review. Have a great day!" },
  { label: "🆘 Important Update", text: "Hello! This is an important update from Demo Company. Please call us back at your earliest convenience regarding your account. Thank you." },
];

export default function VoiceCampaignsPage() {
  const { businessId } = useBusinessContext();
  const [contacts, setContacts] = useState([{ id: 1, phone: '', name: '' }]);
  const [script, setScript] = useState('');
  const [showScripts, setShowScripts] = useState(false);
  const [csvError, setCsvError] = useState('');
  const fileRef = useRef(null);

  const { sending, result, launchCampaign } = useVoiceCampaign(businessId);

  const addContact = () => setContacts(p => [...p, { id: Date.now(), phone: '', name: '' }]);
  const removeContact = (id) => setContacts(p => p.filter(c => c.id !== id));
  const updateContact = (id, field, val) => setContacts(p => p.map(c => c.id === id ? { ...c, [field]: val } : c));

  const handleCsvUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setCsvError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
      const parsed = lines.map(l => { const p = l.split(/[,;]/); return { phone: (p[0]||'').trim().replace(/\D/g,''), name: (p[1]||'').trim() }; }).filter(p => p.phone.length >= 7);
      if (!parsed.length) { setCsvError('No valid phone numbers found.'); return; }
      setContacts(parsed.map((p, i) => ({ id: i + 1, ...p })));
    };
    reader.readAsText(file);
  };

  const handleSend = async () => {
    const valid = contacts.filter(c => c.phone.replace(/\D/g,'').length >= 7);
    if (!valid.length || !script.trim()) return;
    try {
      await launchCampaign({ contacts: valid.map(c => ({ phone: c.phone.replace(/\D/g,''), name: c.name })), message: script.trim() });
    } catch { }
  };

  const validCount = contacts.filter(c => c.phone.replace(/\D/g,'').length >= 7).length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '99px', padding: '4px 12px', marginBottom: '12px' }}>
            <PhoneCall size={11} color="#60a5fa" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Outbound Dispatch</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)', margin: 0 }}>Voice Campaigns</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', fontWeight: 500 }}>
            Automate outbound outreach with hyper-realistic AI voices.
          </p>
        </motion.div>
      </div>

      {/* Warning/Required Banner */}
      <div style={{ ...S.card, padding: '14px 20px', background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Mic size={18} color="#60a5fa" />
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Configuration Requirement:</strong> Requires an active Twilio number in <Link href="/dashboard/channels/voice" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>Voice AI & Phones</Link> and a trained VAPI assistant.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left Column: Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ ...S.card, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={15} color="#60a5fa" /> Call List
              </h2>
              <button onClick={() => fileRef.current?.click()} style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase' }}>
                <Upload size={12} /> Import
              </button>
              <input type="file" ref={fileRef} accept=".csv,.txt" style={{ display: 'none' }} onChange={handleCsvUpload} />
            </div>

            {csvError && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', fontSize: '11px', fontWeight: 600, marginBottom: '16px', display: 'flex', gap: '8px' }}><AlertTriangle size={14} /> {csvError}</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeght: '400px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
              {contacts.map((c, idx) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', width: '16px', textAlign: 'right' }}>{idx + 1}</span>
                  <input value={c.phone} onChange={e => updateContact(c.id, 'phone', e.target.value)} placeholder="Number" style={{ ...S.input, flex: 1.5, fontFamily: 'monospace' }} />
                  <input value={c.name} onChange={e => updateContact(c.id, 'name', e.target.value)} placeholder="Name" style={{ ...S.input, flex: 1 }} />
                  {contacts.length > 1 && <button onClick={() => removeContact(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}><Trash2 size={14} /></button>}
                </div>
              ))}
            </div>

            <button onClick={addContact} style={{ ...S.btn, width: '100%', marginTop: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', justifyContent: 'center', borderStyle: 'dashed' }}>
              <Plus size={14} /> Add Recipient
            </button>
          </div>

          <div style={{ ...S.card, padding: '24px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={13} color="#f59e0b" /> Best Practices
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                "Only call opted-in recipients",
                "Keep scripts under 30 seconds",
                "State company name immediately",
                "Observe regional calling hours",
                "Ensure TCPA / GDPR compliance"
              ].map(t => (
                <div key={t} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f59e0b' }} /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Script & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ ...S.card, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={15} color="#60a5fa" /> Campaign Script
              </h2>
              <button onClick={() => setShowScripts(!showScripts)} style={{ fontSize: '10px', fontWeight: 800, color: '#60a5fa', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase' }}>
                <Sparkles size={11} /> {showScripts ? "Close" : "Templates"}
              </button>
            </div>

            <AnimatePresence>
              {showScripts && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '4px' }}>
                    {SCRIPTS.map(s => (
                      <button key={s.label} onClick={() => { setScript(s.text); setShowScripts(false); }} style={{ textAlign: 'left', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }} className="template-btn">
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.label}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }} className="line-clamp-2">{s.text}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Enter the AI's spoken message..." style={{ ...S.input, height: '240px', resize: 'none', padding: '16px', lineHeight: 1.6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {script.length} characters
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#00E88F' }}>
                ~{Math.ceil(script.split(' ').filter(Boolean).length / 2.5)}s estimated duration
              </div>
            </div>
          </div>

          <div style={{ ...S.card, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Valid Contacts</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{validCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Channel</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <BarChart3 size={14} /> VAPI Neural Voice
                  </div>
                </div>
              </div>
              <button onClick={handleSend} disabled={sending || validCount === 0 || !script.trim()} style={{ ...S.btn, padding: '14px 28px', background: 'linear-gradient(135deg,#60a5fa,#3b82f6)', color: '#fff', border: 'none', boxShadow: '0 0 30px rgba(59,130,246,0.3)', opacity: (sending || validCount === 0 || !script.trim()) ? 0.4 : 1 }}>
                {sending ? <Loader2 size={18} className="animate-spin" /> : <><PhoneCall size={18} /> Launch Campaign</>}
              </button>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px', padding: '16px', borderRadius: '16px', background: result.error ? 'rgba(239,68,68,0.1)' : 'rgba(0,232,143,0.1)', border: `1px solid ${result.error ? 'rgba(239,68,68,0.2)' : 'rgba(0,232,143,0.2)'}`, display: 'flex', gap: '12px' }}>
                  {result.error ? <XCircle size={20} color="#ef4444" /> : <CheckCircle2 size={20} color="#00E88F" />}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: result.error ? '#ef4444' : '#00E88F' }}>{result.error ? 'Dispatch Error' : 'Campaign Dispatched'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{result.error || result.message || "Campaign started successfully."}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      <style>{`
        .template-btn:hover { background: rgba(96,165,250,0.08) !important; border-color: rgba(96,165,250,0.3) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
