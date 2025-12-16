'use client';
/**
 * hooks/useNotifications.js
 * Fetches and subscribes to real-time notifications for the active business.
 */
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBusinessContext } from '@/context/BusinessContext';

export function useNotifications() {
  const { businessId } = useBusinessContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!businessId) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read_at).length);
    }
  }, [businessId]);

  const markAsRead = async (id) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('business_id', businessId);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null)
      .eq('business_id', businessId);
  };

  useEffect(() => {
    if (!businessId) return;
    fetchNotifications();

    const channel = supabase.channel(`notifications_${businessId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `business_id=eq.${businessId}` 
      }, payload => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [businessId, fetchNotifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
