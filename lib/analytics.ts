

const hasPublicGaId = () => Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());

/** GA4 script and hits load only in production when a measurement ID is set. */
export function isGaEnabled(): boolean {
  return process.env.NODE_ENV === "production" && hasPublicGaId();
}

async function sendGaEvent(...args: unknown[]): Promise<void> {
  if (!isGaEnabled() || typeof window === "undefined") return;
  const { sendGAEvent } = await import("@next/third-parties/google");
  (sendGAEvent as (...a: unknown[]) => void)(...args);
}

/** GA4 recommended event `search` */
export function trackGaSearch(searchTerm: string): void {
  void sendGaEvent("event", "search", { search_term: searchTerm });
}

/** GA4 recommended event `sign_up` */
export function trackGaSignUp(method?: string): void {
  void sendGaEvent("event", "sign_up", method ? { method } : {});
}

/** GA4 recommended event `login` */
export function trackGaLogin(method?: string): void {
  void sendGaEvent("event", "login", method ? { method } : {});
}

/** GA4 recommended event `purchase` — pass currency, value, transaction_id when known */
export function trackGaPurchase(params: {
  transaction_id: string;
  value: number;
  currency?: string;
  items?: unknown[];
}): void {
  void sendGaEvent("event", "purchase", {
    currency: params.currency ?? "GEL",
    value: params.value,
    transaction_id: params.transaction_id,
    ...(params.items ? { items: params.items } : {}),
  });
}
