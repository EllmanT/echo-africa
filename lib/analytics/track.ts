"use client";

type Params = { step?: number };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const SESSION_KEY = "eka_sid";

function sessionId(): string {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/** Sends a funnel event to GA4 (when loaded) and to our own events collection. */
export function track(name: string, params: Params = {}) {
  try {
    window.gtag?.("event", name, params);
    const payload = JSON.stringify({
      name,
      sessionId: sessionId(),
      step: params.step,
      path: window.location.pathname,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/events", { method: "POST", body: payload, keepalive: true });
    }
  } catch {
    // Tracking must never break the page.
  }
}
