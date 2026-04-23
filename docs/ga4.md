# Google Analytics 4 (Mipove frontend)

## Setup

1. Create a GA4 property in [Google Analytics](https://analytics.google.com/) and copy the **Measurement ID** (`G-XXXXXXXXXX`).
2. Add to **production** environment (and optionally `.env.local` only if you use a **separate** dev property — see below):

   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. Rebuild and deploy: `npm run build` then restart the Node/PM2 process.

The app **does not** load GA when `NODE_ENV === 'development'`, so `npm run dev` will not send hits to the ID above. To test GA from a laptop, use `npm run build && npm start` with the ID set, or create a second GA4 property for staging.

## EU / consent

If you have visitors in the EEA/UK, you typically need **consent** before loading advertising/analytics cookies. This integration loads GA only in production when the env var is set; it does **not** include a cookie banner. Before enabling in production for EU traffic, add Consent Mode v2 + a CMP, or legal sign-off.

## Verify

1. **GA4 Realtime**: Admin → Reports → **Realtime**; open the site in another tab and confirm active users / page views.
2. **DebugView**: GA4 → Admin → **DebugView** (requires `debug_mode` in config or Google Analytics Debugger Chrome extension for some setups).
3. **Tag Assistant**: Chrome extension [Tag Assistant Legacy](https://chrome.google.com/webstore) or the newer Google tooling to confirm tags fire on navigation.

## SPA page views

`GoogleAnalytics` from `@next/third-parties/google` plus `GaRouteTracker` send `gtag('config', …, { page_path })` on client-side route changes (App Router).

## Custom events (optional)

From client code:

```ts
import { trackGaSearch, trackGaLogin, trackGaSignUp, trackGaPurchase } from "@/lib/analytics";

trackGaSearch("electrician");
trackGaLogin("email");
```

These no-op when GA is disabled (dev or missing ID).
