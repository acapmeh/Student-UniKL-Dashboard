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

export type ClassTimingPhase = 'upcoming_soon' | 'live' | 'default';

export interface ClassTimingStatus {
  phase: ClassTimingPhase;
  isLive: boolean;
  isStartingSoon: boolean;
  secondsUntilStart: number;
  countdownLabel: string;
  minutesRemaining: number;
  remainingLabel: string;
}

const INACTIVE_CLASS_TIMING: ClassTimingStatus = {
  phase: 'default',
  isLive: false,
  isStartingSoon: false,
  secondsUntilStart: 0,
  countdownLabel: '',
  minutesRemaining: 0,
  remainingLabel: '',
};

/**
 * Parses 24-hour "HH:MM" into minutes since midnight (0..1439).
 */
export function parseTimeToMinutes(time24?: string): number | null {
  if (!time24 || typeof time24 !== 'string') return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time24.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Formats seconds until start into MM:SS countdown string (e.g. "29:45").
 */
export function formatCountdownMMSS(secondsUntilStart: number): string {
  const safe = Math.max(0, Math.floor(secondsUntilStart));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats positive remaining minutes cleanly (e.g. "25m left", "1h left", "1h 45m left").
 */
export function formatRemainingDuration(minutesRemaining: number): string {
  const safeMins = Math.max(1, Math.round(minutesRemaining));
  const hours = Math.floor(safeMins / 60);
  const mins = safeMins % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m left`;
  if (hours > 0) return `${hours}h left`;
  return `${mins}m left`;
}

/**
 * Evaluates whether a Mon-Fri timetable entry is within the pre-start countdown window
 * (default 30 minutes prior) or currently live at the supplied local timestamp `now`.
 * Pass `now = null` during SSR to prevent hydration mismatches.
 */
export function getClassTimingStatus(
  entry: { day: number; startTime: string; endTime: string },
  now: Date | null,
  preStartWindowMinutes: number = 30
): ClassTimingStatus {
  if (!now) return INACTIVE_CLASS_TIMING;

  const jsDay = now.getDay(); // 0=Sun..6=Sat
  const mondayBasedDay = jsDay === 0 ? 6 : jsDay - 1;
  if (mondayBasedDay > 4 || entry.day !== mondayBasedDay) {
    return INACTIVE_CLASS_TIMING;
  }

  const startMin = parseTimeToMinutes(entry.startTime);
  const endMin = parseTimeToMinutes(entry.endTime);
  if (startMin === null || endMin === null || endMin <= startMin) {
    return INACTIVE_CLASS_TIMING;
  }

  const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const startSeconds = startMin * 60;
  const endSeconds = endMin * 60;

  if (nowSeconds >= startSeconds && nowSeconds < endSeconds) {
    const minutesRemaining = Math.max(1, Math.ceil((endSeconds - nowSeconds) / 60));
    return {
      phase: 'live',
      isLive: true,
      isStartingSoon: false,
      secondsUntilStart: 0,
      countdownLabel: '',
      minutesRemaining,
      remainingLabel: formatRemainingDuration(minutesRemaining),
    };
  }

  const windowSeconds = Math.max(0, preStartWindowMinutes) * 60;
  const diffToStart = startSeconds - nowSeconds;
  if (diffToStart > 0 && diffToStart <= windowSeconds) {
    return {
      phase: 'upcoming_soon',
      isLive: false,
      isStartingSoon: true,
      secondsUntilStart: diffToStart,
      countdownLabel: formatCountdownMMSS(diffToStart),
      minutesRemaining: 0,
      remainingLabel: '',
    };
  }

  return INACTIVE_CLASS_TIMING;
}
