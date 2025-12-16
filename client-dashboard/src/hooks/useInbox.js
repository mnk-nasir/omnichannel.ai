'use client';
/**
 * hooks/useInbox.js
 * Data + action hook for Inbox page.
 * Handles conversations list, message thread, human/AI toggle, and reply sending.
 */
import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || '';
const DEFAULT_BIZ_ID = '00000000-0000-4000-8000-000000000001';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function useInbox(businessId) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: sbErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });
      if (sbErr) throw sbErr;
      setConversations(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const fetchMessages = useCallback(async (conversationId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }, []);

  const sendReply = useCallback(async (to, message, source, conversationId) => {
    const res = await fetch(`${GATEWAY}/api/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        message,
        source,
        business_id: businessId,
        sender: 'human',
        conversation_id: conversationId
      })
    });
    if (!res.ok) throw new Error(`Send failed: ${res.status}`);
    return res.json();
  }, [businessId]);

  const resolveConversation = useCallback(async (conversationId) => {
    await supabase
      .from('conversations')
      .update({ status: 'resolved' })
      .eq('id', conversationId);
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, status: 'resolved' } : c)
    );
  }, []);

  const toggleAIPause = useCallback(async (phone, paused) => {
    await fetch(`${GATEWAY}/api/agent/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_phone: phone, business_id: businessId, paused })
    });
  }, [businessId]);

  return {
    conversations, selected, setSelected, messages,
    loading, error,
    fetchConversations, fetchMessages, sendReply,
    resolveConversation, toggleAIPause
  };
}
