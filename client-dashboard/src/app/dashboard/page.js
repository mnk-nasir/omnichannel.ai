'use client';

import Link from 'next/link';
import {
  MessageSquare, Phone, Bot, BookOpen,
  TrendingUp, TrendingDown, RefreshCw, ArrowUpRight,
  Inbox, Zap, PhoneCall, Sparkles, MessageCircle,
  BarChart3, Activity, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useBusinessContext } from '@/context/BusinessContext';
import { SandboxChat } from '@/components/SandboxChat';

/* ── Micro Sparkline ─────────────────────────────────────── */
function Sparkline({ data, color = '#00E88F' }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const w = 100, h = 32;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.count / max) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible opacity-80">
      <defs>
        <linearGradient id="sline" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="url(#sline)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

/* ── KPI Card ────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon, sparkline, delta, href, accent = '#00E88F' }) {
  const inner = (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        boxShadow: 'var(--shadow-card)',
        cursor: href ? 'pointer' : 'default',
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.3s',
      }}
      className="card-shine kpi-card"
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: `${accent}12`, border: `1px solid ${accent}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
        }}>
          {icon}
        </div>
        {sparkline && <Sparkline data={sparkline} color={accent} />}
      </div>

      <div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '6px' }}>
          {label}
        </div>
      </div>

      {(sub || delta !== undefined) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          {delta !== undefined && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: delta >= 0 ? '#00E88F' : '#EF4444',
            }}>
              {delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(delta)}%
            </span>
          )}
          {sub && <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sub}</span>}
          {href && (
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
              <ArrowUpRight size={13} />
            </span>
          )}
        </div>
      )}
    </motion.div>
  );

  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

/* ── Section header ──────────────────────────────────────── */
function SectionHeader({ icon, title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
        <span style={{ color: '#00E88F' }}>{icon}</span>
        {title}
      </h3>
      {action}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function DashboardOverview() {
  const { businessId, loading: bizLoading } = useBusinessContext();
  const { stats, loading, error, refresh } = useAnalytics(businessId);

  if (bizLoading || loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Skeleton loader */}
        <div style={{ marginBottom: '32px' }}>
          <div className="shimmer" style={{ height: '14px', width: '120px', borderRadius: '8px', marginBottom: '12px' }} />
          <div className="shimmer" style={{ height: '36px', width: '300px', borderRadius: '10px', marginBottom: '8px' }} />
          <div className="shimmer" style={{ height: '14px', width: '220px', borderRadius: '8px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="shimmer" style={{ height: '160px', borderRadius: '20px' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div className="shimmer" style={{ height: '280px', borderRadius: '20px' }} />
          <div className="shimmer" style={{ height: '280px', borderRadius: '20px' }} />
        </div>
      </div>
    );
  }

  const s = stats;
  const total = s ? (s.channels.whatsapp || 0) + (s.channels.voice || 0) + (s.channels.web || 0) + (s.channels.other || 0) : 0;
  const waP  = total ? Math.round(((s.channels.whatsapp || 0) / total) * 100) : 0;
  const voP  = total ? Math.round(((s.channels.voice   || 0) / total) * 100) : 0;
  const webP = Math.max(0, 100 - waP - voP);

  const channels = [
    { label: 'WhatsApp',      count: s?.channels.whatsapp || 0, pct: waP,  color: '#128C7E', icon: <MessageCircle size={13} /> },
    { label: 'Neural Voice',  count: s?.channels.voice    || 0, pct: voP,  color: '#6366F1', icon: <PhoneCall size={13} /> },
    { label: 'Web / Other',   count: s?.channels.other    || 0, pct: webP, color: '#3B82F6', icon: <Zap size={13} /> },
  ];

  const perfStats = [
    { label: 'Avg Resolution', value: '94%',   sub: 'Target 90%',    ok: true  },
    { label: 'AI Confidence',  value: 'High',  sub: 'Model v4.2',    ok: true  },
    { label: 'Response Time',  value: '<2s',   sub: 'Ultra-low',     ok: true  },
  ];

  const quickActions = [
    { href: '/dashboard/setup-agent',      icon: <Bot size={18} />,         label: 'Setup Agent',    accent: '#00E88F' },
    { href: '/dashboard/knowledge',        icon: <BookOpen size={18} />,    label: 'Add Knowledge',  accent: '#6366F1' },
    { href: '/dashboard/voice-campaigns',  icon: <Phone size={18} />,       label: 'Voice Blast',    accent: '#3B82F6' },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'rgba(0,232,143,0.08)', border: '1px solid rgba(0,232,143,0.2)',
            borderRadius: '99px', padding: '4px 12px', marginBottom: '14px',
          }}>
            <Sparkles size={11} color="#00E88F" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#00E88F', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Live Console</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>
            System{' '}
            <span style={{ background: 'linear-gradient(135deg,#00E88F,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Overview
            </span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', fontWeight: 500 }}>
            Real-time metrics · Omnixa AI Engine
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            borderRadius: '12px', fontSize: '11px', fontWeight: 800,
            color: '#00E88F', textTransform: 'uppercase', letterSpacing: '0.1em',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </motion.button>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '24px' }}
      >
        <KpiCard label="Total Interactions" value={s?.messages.total.toLocaleString() || '—'}
          delta={s?.messages.delta} icon={<MessageSquare size={18} />} sparkline={s?.sparkline}
          href="/dashboard/inbox" accent="#00E88F" />
        <KpiCard label="Active Sessions" value={s?.conversations.total.toLocaleString() || '—'}
          sub={`${s?.conversations.open || 0} open · ${s?.conversations.resolved || 0} resolved`}
          icon={<Inbox size={18} />} href="/dashboard/inbox" accent="#6366F1" />
        <KpiCard label="Knowledge Sources" value={s?.knowledgeSources.toLocaleString() || '—'}
          sub="AI Context Points" icon={<BookOpen size={18} />} href="/dashboard/knowledge" accent="#3B82F6" />
      </motion.div>

      {/* ── Middle Row — Channel Matrix + Performance ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.10 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '18px', marginBottom: '24px' }}
      >
        {/* Channel matrix */}
        <div style={{
          background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border)', borderRadius: '20px', padding: '24px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <SectionHeader icon={<BarChart3 size={14} />} title="Channel Matrix" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {channels.map(ch => (
              <div key={ch.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <span style={{ color: ch.color }}>{ch.icon}</span>
                    {ch.label}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: ch.color }}>{ch.pct}%</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${ch.pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ height: '100%', background: ch.color, borderRadius: '99px', boxShadow: `0 0 8px ${ch.color}60` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance stats */}
        <div style={{
          background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border)', borderRadius: '20px', padding: '24px',
          boxShadow: 'var(--shadow-card)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center',
        }}>
          <div>
            <SectionHeader icon={<Zap size={14} />} title="Resolution Hub" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {perfStats.map(stat => (
                <div key={stat.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {stat.label}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', fontWeight: 900, color: '#00E88F', margin: 0 }}>{stat.value}</p>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radial gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="transparent" />
                <circle cx="70" cy="70" r="58" stroke="url(#gaugeGrad)" strokeWidth="10"
                  strokeDasharray={364} strokeDashoffset={364 - (364 * 0.85)}
                  strokeLinecap="round" fill="transparent" />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00E88F" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>85%</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>AI Logic</span>
              </div>
            </div>
            <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginTop: '14px' }}>
              Neural Efficiency
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Activity Chart ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
        style={{
          background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border)', borderRadius: '20px', padding: '28px',
          marginBottom: '24px', boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top rainbow line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #00E88F80, #6366F180, transparent)' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            <Activity size={14} color="#00E88F" />
            Activity Timeline
          </h3>
          <Link href="/dashboard/inbox" style={{
            fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textDecoration: 'none',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px',
            transition: 'color 0.2s',
          }}>
            View All
          </Link>
        </div>

        {/* Bar chart */}
        {s?.sparkline?.length ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
            {s.sparkline.map((d, i) => {
              const max = Math.max(...s.sparkline.map(x => x.count), 1);
              const pct = Math.max((d.count / max) * 100, 4);
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.03, ease: 'easeOut' }}
                  title={`${d.count} messages · ${d.date}`}
                  style={{
                    flex: 1, background: 'rgba(0,232,143,0.12)', borderRadius: '6px 6px 0 0',
                    cursor: 'help', transition: 'background 0.2s', minHeight: '4px',
                    position: 'relative',
                  }}
                  className="bar-item"
                />
              );
            })}
          </div>
        ) : (
          <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No activity data yet
          </div>
        )}

        <style>{`.bar-item:hover { background: rgba(0,232,143,0.30) !important; }`}</style>
      </motion.div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.20 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '36px' }}
      >
        {quickActions.map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--border)', borderRadius: '16px', padding: '18px 20px',
                boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'border-color 0.2s',
              }}
              className="quick-action-card"
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                background: `${a.accent}15`, border: `1px solid ${a.accent}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: a.accent,
              }}>
                {a.icon}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{a.label}</p>
                <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick access</p>
              </div>
              <ArrowUpRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
            </motion.div>
          </Link>
        ))}
        <style>{`.quick-action-card:hover { border-color: rgba(0,232,143,0.25) !important; }`}</style>
      </motion.div>

      {/* ── Voice Sandbox ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
        style={{ paddingBottom: '40px' }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)',
            textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px',
          }}>
            <PhoneCall size={14} color="#00E88F" />
            Voice Sandbox
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, maxWidth: '480px', fontWeight: 400 }}>
            Test your agent's voice capabilities directly from the browser with ultra-low latency VAPI integration.
          </p>
        </div>
        <SandboxChat />
      </motion.div>

      {/* Global spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
