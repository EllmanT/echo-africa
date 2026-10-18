"use client";

import { useEffect, useRef, useState } from "react";

import { siteConfig } from "@/lib/seo/site";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
/** How long the invisible check may take before we tell the visitor what is going on. */
const SLOW_AFTER_MS = 8000;
let loading: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/**
 * Invisible-unless-needed bot check. Calls onToken(token) when the visitor passes and onToken(null) when the
 * token expires or the check errors. Tokens are single use: bump `resetSignal` after every submit attempt.
 * If no token arrives within a few seconds (ad blocker, blocked network, slow phone) it says so in plain words
 * and offers WhatsApp, so a stuck check never silently costs a lead.
 */
const TurnstileWidget = ({
  action,
  onToken,
  resetSignal = 0,
}: {
  action: string;
  onToken: (token: string | null) => void;
  resetSignal?: number;
}) => {
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [hasToken, setHasToken] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !box.current) return;
    let cancelled = false;
    const give = (token: string | null) => {
      setHasToken(Boolean(token));
      callback.current(token);
    };
    loadTurnstile()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          appearance: "interaction-only",
          callback: (token: string) => give(token),
          "expired-callback": () => give(null),
          "error-callback": () => give(null),
        });
      })
      .catch(() => give(null));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [action]);

  useEffect(() => {
    if (resetSignal > 0 && widgetId.current && window.turnstile) {
      setHasToken(false);
      callback.current(null);
      window.turnstile.reset(widgetId.current);
    }
  }, [resetSignal]);

  // Only speak up if the check is genuinely taking long.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || hasToken) {
      setSlow(false);
      return;
    }
    const id = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [hasToken, resetSignal]);

  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <>
      <div ref={box} className="mt-6 flex justify-center" />
      {slow && (
        <p role="status" className="mt-4 text-center text-sm text-muted-foreground">
          The quick security check is taking a while. Please wait a moment, or reload the page.{" "}
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi Tapiwa, the form on your site is stuck. I need help with a project.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Message us on WhatsApp instead
          </a>
          .
        </p>
      )}
    </>
  );
};

export default TurnstileWidget;
