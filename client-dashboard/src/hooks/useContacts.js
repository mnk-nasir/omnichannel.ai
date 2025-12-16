'use client';
/**
 * hooks/useContacts.js
 * Data + CRUD hook for the Contacts page.
 */
import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function useContacts(businessId) {
  const [contacts, setContacts]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbErr } = await supabase
        .from('contacts')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (sbErr) throw sbErr;
      setContacts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const createContact = useCallback(async (contactData) => {
    const { data, error: sbErr } = await supabase
      .from('contacts')
      .insert([{ ...contactData, business_id: businessId }])
      .select()
      .single();
    if (sbErr) throw sbErr;
    setContacts(prev => [data, ...prev]);
    return data;
  }, [businessId]);

  const updateContact = useCallback(async (id, updates) => {
    const { data, error: sbErr } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (sbErr) throw sbErr;
    setContacts(prev => prev.map(c => c.id === id ? data : c));
    return data;
  }, []);

  const deleteContact = useCallback(async (id) => {
    const { error: sbErr } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    if (sbErr) throw sbErr;
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    contacts, loading, error,
    fetchContacts, createContact, updateContact, deleteContact
  };
}
