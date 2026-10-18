/**
 * Escapes one CSV cell. Cells starting with = + - @ (or tab/CR) are prefixed with an apostrophe so
 * Excel and Sheets treat attacker-supplied lead text as text, never as a formula.
 */
export function csvCell(value: unknown): string {
  let s = value === undefined || value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
