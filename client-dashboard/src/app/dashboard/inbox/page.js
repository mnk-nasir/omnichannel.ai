"use client";
import React, { useState, useEffect } from 'react';
import {
  Search, CheckCircle2, MoreVertical,
  PauseCircle, PlayCircle, Send, Hash, Calendar,
  MessageSquare, UserPlus, Tag, Flag, Filter, Sparkles, User, Zap, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { fetchConversations, fetchMessages, updateConversationStatus } from './actions';
import ConversationList from '@/components/inbox/ConversationList';
import ChatThread from '@/components/inbox/ChatThread';

const supabase = createClient();

const S = {
  container: { display: 'flex', height: 'calc(100vh - 180px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' },
  sidebar: { width: '320px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, background: 'rgba(0,0,0,0.1)' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', minWidth: 0 },
  input: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' },
  header: { height: '72px', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  btn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s' }
};

export default function OmnichannelInbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState("");
  const [aiPaused, setAiPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchConversations();
      setConversations(data);
      setLoading(false);
    };
    load();

    const channel = supabase.channel('inbox-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, (payload) => {
        setConversations(prev => {
          const updated = [...prev];
          const index = updated.findIndex(c => c.id === (payload.new?.id || payload.old?.id));
          if (index !== -1) {
            if (payload.eventType === 'DELETE') {
              updated.splice(index, 1);
              return updated;
            }
            updated[index] = payload.new;
            return updated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
          } else {
            return [payload.new, ...prev].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
          }
        });
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (!selectedConv) return;
    const load = async () => {
      const data = await fetchMessages(selectedConv.id);
      setMessages(data);
    };
    load();

    const chatChannel = supabase.channel(`chat-${selectedConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConv.id}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      }).subscribe();

    return () => supabase.removeChannel(chatChannel);
  }, [selectedConv]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedConv) return;
    const currentReply = reply;
    setReply("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      await fetch('/api/messages/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: selectedConv.contact_phone,
          message: currentReply,
          source: selectedConv.channel || 'whatsapp',
          business_id: selectedConv.business_id,
          conversation_id: selectedConv.id,
          sender: 'agent'
        })
      });
    } catch (err) { console.error("Failed to send message", err); }
  };

  const updateConvStatus = async (status) => {
    if (!selectedConv) return;
    await updateConversationStatus(selectedConv.id, status);
    setSelectedConv(prev => ({ ...prev, status }));
    setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, status } : c));
  };

  const filteredConversations = (conversations || []).filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = !search ||
      (c.contact_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_phone || "").includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={S.container}>
      
      {/* 1. Sidebar */}
      <div style={S.sidebar}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <MessageSquare size={16} color="#00E88F" /> Control Inbox
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search streams..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, paddingLeft: '36px', height: '38px' }} />
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
            {['open', 'resolved', 'all'].map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ flex: 1, padding: '7px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', background: filter === t ? '#00E88F' : 'rgba(255,255,255,0.04)', color: filter === t ? '#000' : 'var(--text-secondary)', border: 'none', transition: 'all 0.2s' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={24} className="animate-spin" color="var(--text-muted)" />
          </div>
        ) : (
          <ConversationList conversations={filteredConversations} selectedId={selectedConv?.id} onSelect={setSelectedConv} />
        )}
      </div>

      {/* 2. Main Content */}
      <div style={S.main}>
        {selectedConv ? (
          <>
            {/* Header */}
            <div style={S.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0,232,143,0.1)', border: '1px solid rgba(0,232,143,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E88F', fontWeight: 900, fontSize: '16px' }}>
                  {(selectedConv.contact_name || selectedConv.contact_phone)[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{selectedConv.contact_name || selectedConv.contact_phone}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={10} /> {selectedConv.contact_phone}</span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)' }} />
                    <span style={{ fontSize: '11px', color: '#00E88F', fontWeight: 700 }}>Stream Encrypted</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setAiPaused(!aiPaused)} style={{ ...S.btn, background: aiPaused ? 'rgba(251,191,36,0.1)' : 'rgba(0,232,143,0.1)', border: `1px solid ${aiPaused ? 'rgba(251,191,36,0.2)' : 'rgba(0,232,143,0.2)'}`, color: aiPaused ? '#fbbf24' : '#00E88F' }}>
                  {aiPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                  {aiPaused ? "Resume AI" : "AI Processing"}
                </button>
                <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />
                <button onClick={() => updateConvStatus(selectedConv.status === 'open' ? 'resolved' : 'open')} style={{ ...S.btn, background: selectedConv.status === 'resolved' ? '#00E88F' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: selectedConv.status === 'resolved' ? '#000' : 'var(--text-secondary)', padding: '10px' }}>
                  <CheckCircle2 size={15} />
                </button>
                <button style={{ ...S.btn, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '10px' }}>
                  <MoreVertical size={15} />
                </button>
              </div>
            </div>

            {/* Chat */}
            <ChatThread messages={messages} currentBusinessId={selectedConv.business_id} />

            {/* Input Area */}
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
              <form onSubmit={handleSendMessage} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px', padding: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type a message or use / for commands..." rows={2} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', padding: '12px 16px', resize: 'none', lineHeight: 1.6 }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[Tag, Flag, UserPlus].map((Icon, i) => (
                      <button key={i} type="button" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="tool-btn"><Icon size={15} /></button>
                    ))}
                  </div>
                  <button type="submit" disabled={!reply.trim()} style={{ ...S.btn, background: 'linear-gradient(135deg, #00E88F, #00c97a)', color: '#000', border: 'none', padding: '10px 24px', fontSize: '12px', opacity: !reply.trim() ? 0.4 : 1, boxShadow: '0 0 20px rgba(0,232,143,0.25)' }}>
                    Dispatch <Send size={13} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(0,232,143,0.1)', border: '1px solid rgba(0,232,143,0.2)', color: '#00E88F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 20px 40px rgba(0,232,143,0.1)' }}>
                <MessageSquare size={36} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Control Command Center</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.6, margin: 0 }}>
                Select a neural stream from the library to initiate interception or operator response.
              </p>
            </motion.div>
          </div>
        )}
      </div>

      <style>{`
        .tool-btn:hover { background: rgba(255,255,255,0.05) !important; color: var(--text-primary) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
