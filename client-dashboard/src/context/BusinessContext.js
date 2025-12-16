'use client';
/**
 * context/BusinessContext.js
 * Provides the authenticated user's business_id to the entire dashboard tree.
 * Wrap the dashboard layout with <BusinessProvider> so every page and hook
 * can consume businessId without each doing their own auth lookup.
 *
 * Usage in any component:
 *   import { useBusinessContext } from '@/context/BusinessContext';
 *   const { businessId, loading } = useBusinessContext();
 */
import { createContext, useContext } from 'react';
import { useBusinessId } from '@/hooks/useBusinessId';

const BusinessContext = createContext({ businessId: null, loading: true, error: null });

export function BusinessProvider({ children }) {
  const value = useBusinessId();
  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  return useContext(BusinessContext);
}
