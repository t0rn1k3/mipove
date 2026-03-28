"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale, LocaleContextValue, LocaleProviderProps } from "@/lib/types";

const NEXT_LOCALE = "NEXT_LOCALE";

const LocaleContext = createContext<LocaleContextValue | null>(null);

function setLocaleCookie(locale: AppLocale) {
  document.cookie = `${NEXT_LOCALE}=${locale};path=/;max-age=31536000;samesite=lax`;
}

export function LocaleProvider({
  initialLocale,
  enMessages,
  kaMessages,
  children,
}: LocaleProviderProps) {
  const allMessages = useMemo<Record<AppLocale, Record<string, unknown>>>(
    () => ({ en: enMessages, ka: kaMessages }),
    [enMessages, kaMessages],
  );

  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const pathname = usePathname();

  const setLocale = useCallback(
    (newLocale: AppLocale) => {
      if (newLocale === locale) return;

      setLocaleState(newLocale);
      setLocaleCookie(newLocale);
      document.documentElement.lang = newLocale;

      const pathWithoutLocale =
        (pathname ?? "/").replace(/^\/(en|ka)(\/|$)/, "$2") || "/";
      const targetPath = getPathname({
        href: pathWithoutLocale,
        locale: newLocale,
        forcePrefix: true,
      });
      window.history.replaceState(null, "", targetPath);
    },
    [locale, pathname],
  );

  const value = useMemo(
    () => ({ locale, setLocale }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={allMessages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocaleSwitch() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocaleSwitch must be used within LocaleProvider");
  return ctx;
}
