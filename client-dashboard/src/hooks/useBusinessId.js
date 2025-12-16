'use client';
/**
 * hooks/useBusinessId.js
 * Single source of truth for the authenticated user's business_id.
 *
 * Resolves in this priority order:
 *  1. JWT custom claim `business_id` (fastest — no extra DB call)
 *  2. `profiles` table lookup (fallback)
 *  3. null (user not authenticated)
 *
 * All other hooks consume this instead of each doing their own auth lookup.
 *
 * Usage:
 *   const { businessId, loading } = useBusinessId();
 */
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export function useBusinessId() {
  const [businessId, setBusinessId] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        // 1. Try JWT claim first (zero extra network call)
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (!session) {
          setBusinessId(null);
          return;
        }

        const claimId = session.user?.user_metadata?.business_id
          || session.user?.app_metadata?.business_id;

        if (claimId) {
          if (!cancelled) setBusinessId(claimId);
          return;
        }

        // 2. Fallback: fetch from profiles table
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('business_id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileErr) throw profileErr;
        if (!cancelled) setBusinessId(profile?.business_id || session.user.id);

      } catch (err) {
        console.error('[useBusinessId] Failed to resolve business_id:', err.message);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    resolve();

    // Re-resolve on auth state change (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      resolve();
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  return { businessId, loading, error };
}
