import type { CSSProperties } from "react";

// Shared tokens for the five service drawings. Ink and grey carry the structure, and one
// accent per service carries the point (the same hues as .svc-* in app/globals.css).

export const INK = "#191C21";
export const GREY = "#C9CCD6"; // hairlines, guides, connectors
export const GREY_DK = "#9A9DB0"; // arrowheads
export const MUTE = "#6A6D7C"; // small text
export const FAINT = "#ECEDF2"; // chart guides

export const BLUE = "#2563EB";
export const PURPLE = "#7C3AED";
export const GREEN = "#16A34A";
export const AMBER = "#F59E0B";
export const AMBER_DK = "#D97706";
export const CORAL = "#E5533D";
export const TEAL = "#0E9AA7";
export const RED = "#EA4335";
export const YELLOW = "#FBBC05";

// Brand colours for the real logos shown on the integration drawing.
export const WHATSAPP = "#25D366";
export const GMAIL = "#EA4335";
export const SHEETS = "#0F9D58";
export const QUICKBOOKS = "#2CA01C";

/** Hairline weights. Everything is drawn at these two, nothing thicker. */
export const W = 2;
export const W_THIN = 1.25;

/** Animation delay, read by the .a-* classes in globals.css. */
export const d = (s: number): CSSProperties => ({ ["--d" as string]: `${s}s` });
export const dx = (px: number, s = 0): CSSProperties => ({ ["--dx" as string]: `${px}px`, ["--d" as string]: `${s}s` });
export const dy = (px: number, s = 0): CSSProperties => ({ ["--dy" as string]: `${px}px`, ["--d" as string]: `${s}s` });

export const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 640 512" className="h-full w-full" aria-hidden="true" focusable="false">
    {children}
  </svg>
);
