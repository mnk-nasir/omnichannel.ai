import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '../login/actions';
import Link from 'next/link';
import {
  MessageCircle, MessageSquare, LayoutDashboard,
  FileText, Bot, LogOut, Phone, PhoneCall, Sparkles,
  BookOpen, Zap, Activity, ChevronRight
} from 'lucide-react';
import { BusinessProvider } from '@/context/BusinessContext';
import { Topbar } from '@/components/Topbar';

const NAV_SECTIONS = [
  {
    title: 'Core',
    items: [
      { href: '/dashboard',             icon: LayoutDashboard, label: 'Overview',        accent: 'green'  },
    ]
  },
  {
    title: 'AI Agents',
    items: [
      { href: '/dashboard/setup-agent', icon: Sparkles,       label: 'Agent Lab',       accent: 'green'  },
      { href: '/dashboard/my-agents',   icon: Bot,            label: 'My Agents',       accent: 'indigo' },
      { href: '/dashboard/knowledge',   icon: BookOpen,       label: 'Knowledge Base',  accent: 'indigo' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { href: '/dashboard/inbox',              icon: MessageSquare, label: 'Live Inbox',     accent: 'green',  badge: 'live' },
      { href: '/dashboard/voice-campaigns',    icon: Phone,         label: 'Outbound Voice', accent: 'blue'    },
      { href: '/dashboard/call-logs',          icon: FileText,      label: 'Call Logs',      accent: 'slate'   },
    ]
  },
  {
    title: 'Channels',
    items: [
      { href: '/dashboard/channels/voice',   icon: PhoneCall,      label: 'Voice & Phones',  accent: 'blue'  },
      { href: '/dashboard/whatsapp-connect', icon: MessageCircle,  label: 'WhatsApp',        accent: 'green' },
    ]
  },
];

const ACCENT_MAP = {
  green:  { text: 'text-[#00E88F]',  bg: 'bg-[#00E88F]/10',  border: 'border-[#00E88F]/20' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  blue:   { text: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'  },
  slate:  { text: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20' },
};

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/login');

  const email = user.email;
  const initials = email.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{
          width: '260px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        {/* Sidebar top glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,232,143,0.5), transparent)'
        }} />

        {/* Brand */}
        <div style={{ padding: '28px 24px 20px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #00E88F, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(0,232,143,0.25)',
              flexShrink: 0,
            }}>
              <Zap size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '17px', color: '#F0F4FA', letterSpacing: '-0.03em', lineHeight: 1 }}>Omnixa</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#3E4A57', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '3px' }}>AI Contact Center</div>
            </div>
          </Link>
        </div>

        {/* System status pill */}
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,232,143,0.06)', border: '1px solid rgba(0,232,143,0.15)',
            borderRadius: '10px', padding: '8px 12px',
          }}>
            <span style={{ position: 'relative', width: '7px', height: '7px', display: 'inline-flex' }}>
              <span style={{
                position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
                background: '#00E88F', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite', opacity: 0.6
              }} />
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00E88F', position: 'relative' }} />
            </span>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#00E88F', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Systems Operational
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px' }} className="custom-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} style={{ marginBottom: '4px' }}>
              <div style={{
                fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--text-muted)', padding: '16px 12px 8px',
              }}>
                {section.title}
              </div>
              {section.items.map((item) => {
                const ac = ACCENT_MAP[item.accent] || ACCENT_MAP.green;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 12px', borderRadius: '10px', marginBottom: '2px',
                      textDecoration: 'none', color: 'var(--text-secondary)',
                      border: '1px solid transparent',
                      transition: 'all 0.2s ease',
                      fontSize: '13.5px', fontWeight: 500,
                      position: 'relative',
                    }}
                    className="nav-link-item"
                  >
                    <span style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(255,255,255,0.04)',
                      flexShrink: 0,
                    }}>
                      <Icon size={15} />
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge === 'live' && (
                      <span style={{
                        fontSize: '8px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                        background: 'rgba(0,232,143,0.15)', color: '#00E88F',
                        border: '1px solid rgba(0,232,143,0.25)', borderRadius: '5px',
                        padding: '2px 6px',
                      }}>Live</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User profile footer */}
        <div style={{
          padding: '12px 16px 20px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(0,232,143,0.3), rgba(99,102,241,0.3))',
              border: '1px solid rgba(0,232,143,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, color: '#00E88F',
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F0F4FA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {email.split('@')[0]}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Free Plan</div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title="Log out"
              >
                <LogOut size={13} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100dvh', overflow: 'hidden', position: 'relative' }}>

        {/* Ambient background glow */}
        <div style={{
          position: 'absolute', top: '-200px', right: '-100px',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,232,143,0.04) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '-200px', left: '20%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <BusinessProvider>
          <Topbar />
          <div
            style={{ flex: 1, overflowY: 'auto', padding: '32px', position: 'relative', zIndex: 1 }}
            className="custom-scrollbar"
          >
            {children}
          </div>
        </BusinessProvider>
      </main>

      {/* Nav hover styles injected globally */}
      <style>{`
        .nav-link-item:hover {
          background: rgba(255,255,255,0.04) !important;
          color: #F0F4FA !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
