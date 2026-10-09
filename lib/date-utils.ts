export function getLocalTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatLocalDateString(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = parseDateString(dateStr);
    return d.toLocaleDateString(
      "en-US",
      options || {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return dateStr;
  }
}

export function addDaysToDateStr(dateStr: string, deltaDays: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + deltaDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayOfYear(dateStr: string): number {
  const target = parseDateString(dateStr);
  const start = new Date(target.getFullYear(), 0, 0);
  const diff = target.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Formats a date string (YYYY-MM-DD) or Date object into:
 * "Monday 1st March 2026" format with full weekday, day with ordinal suffix,
 * full month name, and four-digit year.
 */
export function formatDayFullWithOrdinal(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === "string" ? parseDateString(dateInput) : dateInput;
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayOfWeek = dayNames[d.getDay()];
    const dayNum = d.getDate();
    const suffix = getOrdinalSuffix(dayNum);
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();

    return `${dayOfWeek} ${dayNum}${suffix} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
}
