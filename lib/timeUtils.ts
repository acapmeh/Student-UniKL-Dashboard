/**
 * Converts 24-hour "HH:MM" time string into 12-hour AM/PM format (e.g. "19:00" -> "7:00 PM").
 */
export function formatTime12h(time24?: string): string {
  if (!time24 || typeof time24 !== 'string') return '';
  const trimmed = time24.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return trimmed;

  const hours24 = parseInt(match[1], 10);
  const minutes = match[2];
  if (hours24 < 0 || hours24 > 23) return trimmed;

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${period}`;
}

/**
 * Formats two 24-hour time strings into a 12-hour range with en-dash (e.g. "7:00 PM – 8:00 PM").
 */
export function formatTimeRange12h(start24?: string, end24?: string): string {
  const start = formatTime12h(start24);
  const end = formatTime12h(end24);
  if (start && end) return `${start} – ${end}`;
  return start || end || '';
}

/**
 * Formats "YYYY-MM-DD" into "dd/mm/yyyy" directly without timezone drift (e.g. "2026-12-15" -> "15/12/2026").
 */
export function formatDateDMY(dateStr?: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return trimmed;
  return `${match[3]}/${match[2]}/${match[1]}`;
}
