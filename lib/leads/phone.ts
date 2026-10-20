/**
 * Turns what a visitor types into one international number, so a WhatsApp link built from it always works.
 * Zimbabwe is the default home: "077 123 4567", "0771234567" and "771234567" all become +263771234567.
 * Anything already international ("+27 82 123 4567", "0027821234567") is kept as given, minus the punctuation.
 */
export function normalizeWhatsapp(input: string): string {
  const stripped = input.trim().replace(/[\s\-().]/g, "");
  if (!stripped) return "";
  if (stripped.startsWith("+")) return `+${stripped.slice(1).replace(/\D/g, "")}`;
  const digits = stripped.replace(/\D/g, "");
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (/^0\d{9}$/.test(digits)) return `+263${digits.slice(1)}`; // local format with the leading zero
  if (/^7[1-9]\d{7}$/.test(digits)) return `+263${digits}`; // local mobile without the zero
  if (/^263\d{9}$/.test(digits)) return `+${digits}`; // country code typed without the plus
  return digits.length >= 11 ? `+${digits}` : digits;
}

/** A plausible phone number once normalised: 9 to 15 digits, with an optional leading +. */
export const isPlausibleWhatsapp = (normalized: string): boolean => /^\+?\d{9,15}$/.test(normalized);

export const WHATSAPP_ERROR = "Enter your WhatsApp number, like 077 123 4567 or +263 77 123 4567";
