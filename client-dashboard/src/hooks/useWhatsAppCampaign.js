'use client';
/**
 * hooks/useWhatsAppCampaign.js
 * Data + action hook for WhatsApp Broadcast Campaign page.
 */
import { useState, useCallback } from 'react';

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || '';

export function useWhatsAppCampaign(businessId) {
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);
  const [result, setResult]   = useState(null);

  const sendCampaign = useCallback(async ({ contacts, message, delay, tag }) => {
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${GATEWAY}/api/campaigns/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts,
          message,
          business_id: businessId,
          delay: delay || 3000,
          tag
        })
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setResult(data);
      setSuccess(`Campaign started! Sending to ${data.total} contacts.`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSending(false);
    }
  }, [businessId]);

  return { sending, error, success, result, sendCampaign };
}
