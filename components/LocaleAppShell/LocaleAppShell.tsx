"use client";

import type { ReactNode } from "react";
import { CreditBalanceProvider } from "@/components/CreditBalanceContext/CreditBalanceContext";
import ConditionalNavbar from "@/components/ConditionalNavbar";

export default function LocaleAppShell({ children }: { children: ReactNode }) {
  return (
    <CreditBalanceProvider>
      <ConditionalNavbar />
      {children}
    </CreditBalanceProvider>
  );
}
