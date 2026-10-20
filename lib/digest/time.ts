/** Harare is UTC+2 all year (no daylight saving), so a fixed offset is exact. */
const HARARE_OFFSET_MS = 2 * 60 * 60 * 1000;

const harare = (now: Date) => new Date(now.getTime() + HARARE_OFFSET_MS);

/** The hour of the day in Harare, 0 to 23. */
export const harareHour = (now = new Date()): number => harare(now).getUTCHours();

/** Today's date in Harare as YYYY-MM-DD, the same shape as a post's `date`. */
export const harareDateString = (now = new Date()): string => harare(now).toISOString().slice(0, 10);

/** The send window: from the configured hour until 8pm, after which an article is too old to be "today's email". */
export function inSendWindow(now: Date, sendHour: number, lastHour = 20): boolean {
  const h = harareHour(now);
  return h >= sendHour && h < lastHour;
}
