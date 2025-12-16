'use server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/utils/supabase/server';

// Admin client — bypasses RLS (server-only, key never sent to browser)
const adminSupabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Resolves the authenticated user's business_id.
 * Returns null if the user is not logged in.
 */
async function getBusinessId() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Try JWT metadata first (no extra DB call)
  const claimId = user.user_metadata?.business_id || user.app_metadata?.business_id;
  if (claimId) return claimId;

  // Fallback: profiles table
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single();

  return profile?.business_id || null;
}

export async function fetchConversations() {
  const businessId = await getBusinessId();
  if (!businessId) return [];

  const { data, error } = await adminSupabase
    .from('conversations')
    .select('*')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('fetchConversations error:', error.message);
    return [];
  }
  return data || [];
}

export async function fetchMessages(conversationId) {
  const { data, error } = await adminSupabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchMessages error:', error.message);
    return [];
  }
  return data || [];
}

export async function updateConversationStatus(id, status) {
  const { error } = await adminSupabase
    .from('conversations')
    .update({ status })
    .eq('id', id);

  if (error) console.error('updateConversationStatus error:', error.message);
}
