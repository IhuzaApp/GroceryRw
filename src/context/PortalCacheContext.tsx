"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import useSWR, { mutate as globalMutate } from "swr";

// ─── SWR fetcher ──────────────────────────────────────────────────────────────
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Cache keys (use these everywhere so SWR deduplicates) ───────────────────
export const PORTAL_CACHE_KEYS = {
  rfqs: "/api/queries/business-rfqs",
  orders: "/api/queries/business-product-orders",
  stores: "/api/queries/business-stores",
  services: "/api/queries/business-services",
  quotes: "/api/queries/business-submitted-quotes",
  rfqOpportunities: "/api/queries/rfq-opportunities",
  contracts: "/api/queries/business-contracts",
  statsCards: "/api/queries/business-stats-cards",
} as const;

// ─── SWR config shared across all portal queries ──────────────────────────────
// revalidateOnFocus: false   → don't re-fetch when user tabs back to window
// revalidateOnReconnect: false → don't re-fetch on reconnect
// dedupingInterval: 5 min    → same key won't re-fetch within 5 minutes
const PORTAL_SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 5 * 60 * 1000, // 5 minutes
  shouldRetryOnError: false,
};

// ─── Context shape ────────────────────────────────────────────────────────────
interface PortalCacheContextType {
  // Raw SWR results – each section picks what it needs
  rfqs: { data: any[] | undefined; isLoading: boolean; error: any };
  orders: { data: any[] | undefined; isLoading: boolean; error: any };
  stores: { data: any[] | undefined; isLoading: boolean; error: any };
  services: { data: any[] | undefined; isLoading: boolean; error: any };
  quotes: { data: any[] | undefined; isLoading: boolean; error: any };
  rfqOpportunities: { data: any[] | undefined; isLoading: boolean; error: any };
  contracts: { data: any[] | undefined; isLoading: boolean; error: any };

  // Helpers – call these after a mutation so the affected slice re-fetches
  invalidate: (key: keyof typeof PORTAL_CACHE_KEYS) => void;
  invalidateAll: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const PortalCacheContext = createContext<PortalCacheContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PortalCacheProvider({ children }: { children: ReactNode }) {
  // All fetches happen here, once, for the lifetime of the provider.
  // Subsequent "reads" from child components cost zero network round-trips
  // because SWR returns the same cached response.

  const rfqsSWR = useSWR(PORTAL_CACHE_KEYS.rfqs, fetcher, PORTAL_SWR_CONFIG);
  const ordersSWR = useSWR(
    PORTAL_CACHE_KEYS.orders,
    fetcher,
    PORTAL_SWR_CONFIG
  );
  const storesSWR = useSWR(
    PORTAL_CACHE_KEYS.stores,
    fetcher,
    PORTAL_SWR_CONFIG
  );
  const servicesSWR = useSWR(
    PORTAL_CACHE_KEYS.services,
    fetcher,
    PORTAL_SWR_CONFIG
  );
  const quotesSWR = useSWR(
    PORTAL_CACHE_KEYS.quotes,
    fetcher,
    PORTAL_SWR_CONFIG
  );
  const rfqOpportunitiesSWR = useSWR(
    PORTAL_CACHE_KEYS.rfqOpportunities,
    fetcher,
    PORTAL_SWR_CONFIG
  );
  const contractsSWR = useSWR(
    PORTAL_CACHE_KEYS.contracts,
    fetcher,
    PORTAL_SWR_CONFIG
  );

  // Expose each slice in a normalised shape
  const rfqs = {
    data: rfqsSWR.data?.rfqs as any[] | undefined,
    isLoading: !rfqsSWR.data && !rfqsSWR.error,
    error: rfqsSWR.error,
  };

  const orders = {
    data: ordersSWR.data?.orders as any[] | undefined,
    isLoading: !ordersSWR.data && !ordersSWR.error,
    error: ordersSWR.error,
  };

  const stores = {
    data: storesSWR.data?.stores as any[] | undefined,
    isLoading: !storesSWR.data && !storesSWR.error,
    error: storesSWR.error,
  };

  const services = {
    data: servicesSWR.data?.services as any[] | undefined,
    isLoading: !servicesSWR.data && !servicesSWR.error,
    error: servicesSWR.error,
  };

  const quotes = {
    data: quotesSWR.data?.quotes as any[] | undefined,
    isLoading: !quotesSWR.data && !quotesSWR.error,
    error: quotesSWR.error,
  };

  const rfqOpportunities = {
    data: rfqOpportunitiesSWR.data?.rfqs as any[] | undefined,
    isLoading: !rfqOpportunitiesSWR.data && !rfqOpportunitiesSWR.error,
    error: rfqOpportunitiesSWR.error,
  };

  const contracts = {
    data: contractsSWR.data?.contracts as any[] | undefined,
    isLoading: !contractsSWR.data && !contractsSWR.error,
    error: contractsSWR.error,
  };

  // Force-revalidate a single slice (e.g. after creating an RFQ)
  const invalidate = useCallback((key: keyof typeof PORTAL_CACHE_KEYS) => {
    globalMutate(PORTAL_CACHE_KEYS[key]);
  }, []);

  // Nuclear option – re-fetch everything
  const invalidateAll = useCallback(() => {
    Object.values(PORTAL_CACHE_KEYS).forEach((url) => globalMutate(url));
  }, []);

  return (
    <PortalCacheContext.Provider
      value={{
        rfqs,
        orders,
        stores,
        services,
        quotes,
        rfqOpportunities,
        contracts,
        invalidate,
        invalidateAll,
      }}
    >
      {children}
    </PortalCacheContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePortalCache() {
  const ctx = useContext(PortalCacheContext);
  if (!ctx) {
    throw new Error("usePortalCache must be used inside <PortalCacheProvider>");
  }
  return ctx;
}
