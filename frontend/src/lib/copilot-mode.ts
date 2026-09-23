export type CopilotMode = "live" | "demo";

/**
 * Explicit deployment switch for Copilot.
 *
 * `VITE_COPILOT_MODE=live` uses the real ask API.
 * `VITE_COPILOT_MODE=demo` never calls it.
 *
 * If the flag is omitted, production builds stay in demo mode so a deploy
 * without the Python RAG service does not look like a broken Copilot.
 * Local development stays live unless demo is set on purpose.
 */
export function getCopilotMode(): CopilotMode {
  const configured = import.meta.env.VITE_COPILOT_MODE?.trim().toLowerCase();
  if (configured === "live") return "live";
  if (configured === "demo") return "demo";
  return import.meta.env.PROD ? "demo" : "live";
}

export function isCopilotDemoMode() {
  return getCopilotMode() === "demo";
}

/** Brief pause so demo replies reuse the existing loading status, not a second UI. */
export const DEMO_REPLY_DELAY_MS = 700;
