'use client';
/**
 * hooks/useAnalytics.js
 * Fetches real-time business analytics from Supabase.
 * Provides KPI cards, conversation trends, channel breakdown, and recent activity.
 */
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function useAnalytics(businessId) {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetch = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const now   = new Date();
      const week  = new Date(now - 7  * 86400000).toISOString();
      const prev  = new Date(now - 14 * 86400000).toISOString();
      const today = new Date(now - 1  * 86400000).toISOString();

      // Run all queries in parallel
      const [
        { count: totalMessages },
        { count: weekMessages },
        { count: prevMessages },
        { count: totalConvs },
        { count: openConvs },
        { count: resolvedConvs },
        { data: channelData },
        { data: recentConvs },
        { data: dailyMsgs },
        { count: knowledgeSources }
      ] = await Promise.all([
        // Total messages for this business
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
        // Messages this week
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', week),
        // Messages previous week (for delta)
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', prev).lt('created_at', week),
        // Total conversations
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
        // Open conversations
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'open'),
        // Resolved conversations
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'resolved'),
        // Channel breakdown (whatsapp vs voice)
        supabase.from('conversations').select('channel').eq('business_id', businessId),
        // Recent conversations
        supabase.from('conversations').select('id, contact_name, contact_phone, channel, status, last_message, updated_at').eq('business_id', businessId).order('updated_at', { ascending: false }).limit(5),
        // Daily messages for last 7 days (for sparkline)
        supabase.from('messages').select('created_at').eq('business_id', businessId).gte('created_at', week).order('created_at', { ascending: true }),
        // Knowledge sources
        supabase.from('knowledge_sources').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'completed')
      ]);

      // Build channel breakdown
      const channels = { whatsapp: 0, voice: 0, web: 0, other: 0 };
      (channelData || []).forEach(c => {
        const ch = c.channel?.toLowerCase() || 'other';
        channels[ch] = (channels[ch] || 0) + 1;
      });

      // Build 7-day sparkline (messages per day)
      const dayMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        dayMap[d.toISOString().slice(0, 10)] = 0;
      }
      (dailyMsgs || []).forEach(m => {
        const day = m.created_at?.slice(0, 10);
        if (day && dayMap[day] !== undefined) dayMap[day]++;
      });
      const sparkline = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

      // Week-over-week delta
      const msgDelta = prevMessages > 0
        ? Math.round(((weekMessages - prevMessages) / prevMessages) * 100)
        : weekMessages > 0 ? 100 : 0;

      // Handoff rate (human sender / total conversations)
      const handoffRate = totalConvs > 0
        ? Math.round((resolvedConvs / totalConvs) * 100)
        : 0;

      setStats({
        messages:      { total: totalMessages || 0, week: weekMessages || 0, delta: msgDelta },
        conversations: { total: totalConvs || 0, open: openConvs || 0, resolved: resolvedConvs || 0 },
        knowledgeSources: knowledgeSources || 0,
        channels,
        hanoffRate: handoffRate,
        recentConvs:   recentConvs || [],
        sparkline
      });
    } catch (err) {
      console.error('[useAnalytics]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, loading, error, refresh: fetch };
}
