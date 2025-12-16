'use client';
import { Bell, CheckCircle2, Sparkles, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useBusinessContext } from '@/context/BusinessContext';

export function Topbar() {
  const { businessId } = useBusinessContext();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header style={{
      height: '64px',
      background: 'rgba(13,17,23,0.80)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
      position: 'relative', zIndex: 50,
    }}>

      {/* Left — search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '8px 14px', cursor: 'text',
          transition: 'border-color 0.2s',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Quick search...
          </span>
          <kbd style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
            borderRadius: '5px', padding: '1px 6px', letterSpacing: '0.05em',
          }}>⌘K</kbd>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Live status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: 'rgba(0,232,143,0.06)', border: '1px solid rgba(0,232,143,0.15)',
          borderRadius: '8px', padding: '6px 12px',
        }}>
          <span style={{ position: 'relative', width: '6px', height: '6px', display: 'inline-flex', flexShrink: 0 }}>
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: '#00E88F', opacity: 0.6,
              animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E88F', position: 'relative' }} />
          </span>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#00E88F', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            AI Online
          </span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: isOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', cursor: 'pointer',
              position: 'relative', transition: 'all 0.2s',
            }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#00E88F', boxShadow: '0 0 8px rgba(0,232,143,0.8)',
              }} />
            )}
          </button>

          {isOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '320px',
              background: '#131820', border: '1px solid var(--border)',
              borderRadius: '16px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              overflow: 'hidden', zIndex: 100,
              animation: 'fadeUp 0.2s ease',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={13} color="#00E88F" />
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{
                      fontSize: '10px', fontWeight: 800, color: '#00E88F',
                      background: 'rgba(0,232,143,0.12)', borderRadius: '99px',
                      padding: '1px 7px', border: '1px solid rgba(0,232,143,0.2)',
                    }}>{unreadCount}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ fontSize: '10px', fontWeight: 800, color: '#00E88F', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: '360px', overflowY: 'auto' }} className="custom-scrollbar">
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <CheckCircle2 size={28} style={{ margin: '0 auto 12px', color: 'var(--text-muted)', opacity: 0.4 }} />
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      All caught up
                    </p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      style={{
                        padding: '14px 20px', cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                        background: !n.read_at ? 'rgba(0,232,143,0.04)' : 'transparent',
                        transition: 'background 0.2s',
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                      }}
                    >
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                        background: n.type === 'error' ? '#EF4444' : n.type === 'warning' ? '#F59E0B' : '#00E88F',
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>{n.title}</p>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(0,232,143,0.25), rgba(99,102,241,0.25))',
          border: '1px solid rgba(0,232,143,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 800, color: '#00E88F',
          cursor: 'pointer',
        }}>
          OX
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </header>
  );
}
