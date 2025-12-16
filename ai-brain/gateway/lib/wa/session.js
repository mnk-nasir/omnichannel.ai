'use strict';
/**
 * lib/wa/session.js
 * Conversation helper — get or create a conversation record in Supabase.
 */

const log = (level, msg, extra = '') =>
  console.log(`[WhatsApp][${level.toUpperCase()}] ${new Date().toISOString()} ${msg}${extra ? ' | ' + JSON.stringify(extra) : ''}`);

/**
 * Looks up an existing conversation or creates one.
 * @param {object} supabase - Supabase client
 * @param {string} chatId - Raw WA chat ID (e.g. 1234@c.us)
 * @param {string} contactPhone - Normalized phone number
 * @param {string} businessId - Business UUID
 * @returns {object|null} conversation row
 */
async function get_or_create_conversation(supabase, chatId, contactPhone, businessId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('contact_phone', contactPhone)
      .eq('business_id', businessId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert([{
        business_id: businessId,
        contact_phone: contactPhone,
        status: 'open',
        contact_name: contactPhone,
        last_message: 'New conversation'
      }])
      .select()
      .single();

    if (createError) throw createError;
    return newConv;
  } catch (err) {
    log('error', 'get_or_create_conversation failed', { error: err.message });
    return null;
  }
}

module.exports = { get_or_create_conversation };
