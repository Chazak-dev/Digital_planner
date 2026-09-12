export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type TimeFormat = "12h" | "24h";

/** Formats an ISO date string ("YYYY-MM-DD") per the user's saved preference. */
export function formatDate(dateStr: string | null | undefined, format: DateFormat = "MM/DD/YYYY") {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  if (format === "DD/MM/YYYY") return `${d}/${m}/${y}`;
  if (format === "YYYY-MM-DD") return `${y}-${m}-${d}`;
  return `${m}/${d}/${y}`;
}

/** Formats an ISO time string ("HH:MM:SS" or "HH:MM") per the user's saved preference. */
export function formatTime(timeStr: string | null | undefined, format: TimeFormat = "12h") {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  if (!hStr || !mStr) return timeStr;
  if (format === "24h") return `${hStr.padStart(2, "0")}:${mStr}`;
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const twelve = h % 12 || 12;
  return `${twelve}:${mStr} ${period}`;
}

/**
 * Formats a full timestamptz string (e.g. an assessment's due_date) as
 * date + time, using the user's saved formats. Midnight (00:00) is treated
 * as "no time was actually set" and shown as date-only — the convention
 * this app uses since a deadline created without a time is stored at
 * midnight, and there's no separate flag distinguishing that from someone
 * genuinely picking 12:00 AM.
 */
export function formatDateTime(
  isoTimestamp: string | null | undefined,
  dateFormat: DateFormat = "MM/DD/YYYY",
  timeFormat: TimeFormat = "12h",
) {
  if (!isoTimestamp) return "";
  const [datePart, timePartRaw] = isoTimestamp.split("T");
  const timePart = timePartRaw ? timePartRaw.slice(0, 5) : "";
  const dateOut = formatDate(datePart, dateFormat);
  if (!timePart || timePart === "00:00") return dateOut;
  return `${dateOut} ${formatTime(timePart, timeFormat)}`;
}
