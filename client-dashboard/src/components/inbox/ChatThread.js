"use client";
import React, { useRef, useEffect } from 'react';
import { Bot, User, CheckCheck, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatThread({ messages, currentBusinessId }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-[#0B0F14] flex flex-col space-y-6 scroll-smooth custom-scrollbar">
            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-var(--text-muted) opacity-40">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-var(--border) mb-4 flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <p className="text-sm italic">Neural stream waiting for input...</p>
                </div>
            ) : (
                messages.map((m, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={m.id || idx} 
                        className={`flex ${m.sender === 'customer' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div style={{
                            maxWidth: '75%',
                            padding: '14px 18px',
                            borderRadius: '20px',
                            fontSize: '13.5px',
                            lineHeight: 1.6,
                            position: 'relative',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            background: m.sender === 'customer' 
                                ? 'rgba(255,255,255,0.04)' 
                                : m.sender === 'agent'
                                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                    : 'linear-gradient(135deg, #00E88F, #00c97a)',
                            border: `1px solid ${m.sender === 'customer' ? 'var(--border)' : 'transparent'}`,
                            color: m.sender === 'customer' ? 'var(--text-primary)' : '#fff',
                            borderBottomLeftRadius: m.sender === 'customer' ? '4px' : '20px',
                            borderBottomRightRadius: m.sender !== 'customer' ? '4px' : '20px',
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                fontSize: '9px', 
                                fontWeight: 900, 
                                opacity: 0.7, 
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                {m.sender === 'ai' && <><Sparkles size={11} /> <span>Neural Agent</span></>}
                                {m.sender === 'agent' && <><User size={11} /> <span>Operator</span></>}
                                {m.sender === 'customer' && <span>Incoming Node</span>}
                            </div>

                            <div className="break-words">
                                {m.message}
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'flex-end', 
                                gap: '6px', 
                                marginTop: '10px', 
                                paddingTop: '8px', 
                                borderTop: `1px solid ${m.sender === 'customer' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
                                fontSize: '10px',
                                fontWeight: 700,
                                opacity: 0.6
                            }}>
                                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {m.sender !== 'customer' && <CheckCheck size={11} />}
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
}
