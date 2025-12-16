'use client';
/**
 * hooks/useCallLogs.js
 * Fetches call logs from our local Supabase database.
 * Supports realtime updates.
 */
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBusinessContext } from '@/context/BusinessContext';

export function useCallLogs() {
  const { businessId } = useBusinessContext();
  const [calls, setCalls]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchCalls = useCallback(async ({ limit = 50 } = {}) => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('call_logs')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      // Transform data to match previous VAPI structure where needed by the UI
      const formatted = (data || []).map(log => ({
        ...log,
        id: log.vapi_call_id,
        createdAt: log.created_at,
        startedAt: log.started_at,
        endedAt: log.ended_at,
        customer: { number: log.phone_number }
      }));

      setCalls(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  // Optionally set up real-time listener
  useEffect(() => {
    if (!businessId) return;
    
    fetchCalls();

    const channel = supabase.channel(`call_logs_${businessId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'call_logs', 
        filter: `business_id=eq.${businessId}` 
      }, () => {
        fetchCalls();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [businessId, fetchCalls]);

  const filterByStatus = useCallback(
    (status) => calls.filter(c => !status || c.status === status),
    [calls]
  );

  return { calls, loading, error, fetchCalls, filterByStatus };
}
