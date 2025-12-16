'use client';
/**
 * hooks/useAgents.js
 * Data hook for the My Agents page.
 * Centralises all agent CRUD API calls and state management.
 */
import { useState, useCallback } from 'react';

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || '';

export function useAgents(businessId) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const targetBusinessId = (businessId && businessId !== 'null')
        ? businessId
        : '00000000-0000-4000-8000-000000000001';
      const res = await fetch(`${GATEWAY}/api/agents?business_id=${targetBusinessId}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const updateAgent = useCallback(async (agentId, updates) => {
    const res = await fetch(`${GATEWAY}/api/agents?id=${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status}`);
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...updates } : a));
    return res.json();
  }, []);

  const deleteAgent = useCallback(async (agentId) => {
    const res = await fetch(`${GATEWAY}/api/agents?id=${agentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    setAgents(prev => prev.filter(a => a.id !== agentId));
  }, []);

  return { agents, loading, error, fetchAgents, updateAgent, deleteAgent };
}
