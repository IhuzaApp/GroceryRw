"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface BusinessWalletContextType {
  walletBalance: number;
  businessWalletId: string | null;
  businessId: string | null;
  isLoading: boolean;
  fetchWalletBalance: () => Promise<void>;
}

const BusinessWalletContext = createContext<BusinessWalletContextType>({
  walletBalance: 0,
  businessWalletId: null,
  businessId: null,
  isLoading: true,
  fetchWalletBalance: async () => {},
});

export function BusinessWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, role, authReady } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [businessWalletId, setBusinessWalletId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchWalletBalance = async () => {
    if (!isLoggedIn || role === "shopper") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/queries/check-business-wallet");
      if (response.ok) {
        const data = await response.json();
        if (data.wallet) {
          setWalletBalance(parseFloat(data.wallet.amount || "0"));
          setBusinessWalletId(data.wallet.id || null);
          setBusinessId(data.wallet.business_id || null);
        } else {
          setWalletBalance(0);
          setBusinessWalletId(null);
          setBusinessId(null);
        }
      } else {
        setWalletBalance(0);
        setBusinessWalletId(null);
        setBusinessId(null);
      }
    } catch (error) {
      console.error("Error fetching global business wallet balance:", error);
      setWalletBalance(0);
      setBusinessWalletId(null);
      setBusinessId(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authReady) {
      fetchWalletBalance();
    }
  }, [authReady, isLoggedIn, role]);

  return (
    <BusinessWalletContext.Provider
      value={{
        walletBalance,
        businessWalletId,
        businessId,
        isLoading,
        fetchWalletBalance,
      }}
    >
      {children}
    </BusinessWalletContext.Provider>
  );
}

export function useBusinessWallet() {
  return useContext(BusinessWalletContext);
}
