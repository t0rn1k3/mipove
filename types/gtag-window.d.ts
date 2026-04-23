/**
 * GA4 loads `gtag` globally via @next/third-parties `GoogleAnalytics`.
 * Augment `Window` for route updates and custom events.
 */
export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
