"use client";
import { MessageCircle, Globe, Smartphone, User, Hash } from 'lucide-react';

export default function ConversationList({ conversations, selectedId, onSelect }) {
    const getChannelIcon = (channel) => {
        switch (channel) {
            case 'whatsapp': return <MessageCircle size={14} color="#00E88F" />;
            case 'web': return <Globe size={14} color="#60a5fa" />;
            default: return <Smartphone size={14} color="var(--text-muted)" />;
        }
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.length === 0 ? (
                <div style={{ padding: '40px 24px', textAlign: 'center', opacity: 0.4 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>No active streams found.</p>
                </div>
            ) : (
                conversations.map((conv) => {
                    const active = selectedId === conv.id;
                    return (
                        <div
                            key={conv.id}
                            onClick={() => onSelect(conv)}
                            style={{
                                padding: '16px 20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderBottom: '1px solid var(--border)',
                                background: active ? 'rgba(0,232,143,0.06)' : 'transparent',
                                borderLeft: `3px solid ${active ? '#00E88F' : 'transparent'}`,
                                position: 'relative'
                            }}
                            className="conv-item"
                        >
                            <div style={{ display: 'flex', gap: '12px' }}>
                               <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-secondary)' }}>
                                 <User size={18} />
                               </div>
                               <div style={{ flex: 1, minWidth: 0 }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                   <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', truncate: 'true', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                       {conv.contact_name || conv.contact_phone}
                                   </span>
                                   <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                       {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                     <p style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, opacity: 0.8 }}>
                                         {conv.last_message || "Awaiting first node..."}
                                     </p>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                                         {conv.unread_count > 0 && (
                                             <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', background: '#00E88F', color: '#000', fontSize: '10px', fontWeight: 900, borderRadius: '6px', padding: '0 4px' }}>
                                                 {conv.unread_count}
                                             </span>
                                         )}
                                         {getChannelIcon(conv.channel)}
                                     </div>
                                 </div>
                               </div>
                            </div>

                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', background: conv.priority === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${conv.priority === 'high' ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`, color: conv.priority === 'high' ? '#ef4444' : 'var(--text-muted)' }}>
                                    {conv.priority || 'standard'}
                                </span>
                                {active && <div style={{ fontSize: '9px', fontWeight: 800, color: '#00E88F', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00E88F' }} /> ACTIVE</div>}
                            </div>
                        </div>
                    );
                })
            )}
            <style>{`
                .conv-item:hover { background: rgba(255,255,255,0.02) !important; }
            `}</style>
        </div>
    );
}
