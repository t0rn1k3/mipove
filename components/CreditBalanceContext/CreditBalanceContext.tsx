"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCreditBalance, getMe } from "@/lib/api";

export type CreditBalanceContextValue = {
  /** Current balance for masters; */
  balance: number | null;
  loading: boolean;
  /** Re-fetch from `GET /api/credits/balance` */
  refresh: () => Promise<void>;
  /** Optimistic update after spend or purchase redirect. */
  setBalance: (value: number | null) => void;
};

const CreditBalanceContext = createContext<CreditBalanceContextValue | null>(null);

async function fetchBalanceIfMaster(): Promise<number | null> {
  try {
    const { data } = await getMe();
    if (data.role !== "master") return null;
    const { balance } = await getCreditBalance();
    return balance;
  } catch {
    return null;
  }
}

export function CreditBalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const b = await fetchBalanceIfMaster();
      setBalance(b);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      balance,
      loading,
      refresh,
      setBalance,
    }),
    [balance, loading, refresh],
  );

  return (
    <CreditBalanceContext.Provider value={value}>{children}</CreditBalanceContext.Provider>
  );
}

export function useCreditBalance(): CreditBalanceContextValue {
  const ctx = useContext(CreditBalanceContext);
  if (!ctx) {
    throw new Error("useCreditBalance must be used within CreditBalanceProvider");
  }
  return ctx;
}

export function useCreditBalanceOptional(): CreditBalanceContextValue | null {
  return useContext(CreditBalanceContext);
}
