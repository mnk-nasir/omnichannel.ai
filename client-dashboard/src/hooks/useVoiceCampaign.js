'use client';
/**
 * hooks/useVoiceCampaign.js
 * Data + action hook for Voice Campaign page.
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || '';

export function useVoiceCampaign(businessId) {
  const [calls, setCalls]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);

  const fetchCallLogs = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('call_logs')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setCalls(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const launchCampaign = useCallback(async ({ contacts, message, delay }) => {
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${GATEWAY}/api/voice/campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts, message, business_id: businessId, delay })
      });
      if (!res.ok) throw new Error(`Campaign failed: ${res.status}`);
      const data = await res.json();
      setSuccess(`Campaign started! Calling ${data.total} contacts.`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSending(false);
    }
  }, [businessId]);

  const dialSingle = useCallback(async (phone) => {
    const res = await fetch(`${GATEWAY}/api/vapi/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone, business_id: businessId })
    });
    if (!res.ok) throw new Error(`Call failed: ${res.status}`);
    return res.json();
  }, [businessId]);

  return {
    calls, loading, sending, error, success,
    fetchCallLogs, launchCampaign, dialSingle
  };
}
