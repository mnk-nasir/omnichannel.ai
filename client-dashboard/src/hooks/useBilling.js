'use client';
/**
 * hooks/useBilling.js
 * Fetches live billing status + usage logs for the current business.
 */
import { useState, useEffect, useCallback } from 'react';

export function useBilling(businessId) {
  const [status, setStatus]   = useState(null);
  const [usage, setUsage]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const [statusRes, usageRes] = await Promise.all([
        fetch(`/api/billing?business_id=${businessId}&type=status`),
        fetch(`/api/billing?business_id=${businessId}&type=usage`),
      ]);
      const statusData = await statusRes.json();
      const usageData  = await usageRes.json();

      if (!statusRes.ok) throw new Error(statusData.error || 'Failed to load billing status');
      setStatus(statusData);
      setUsage(Array.isArray(usageData) ? usageData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { status, usage, loading, error, refresh: fetchAll };
}
