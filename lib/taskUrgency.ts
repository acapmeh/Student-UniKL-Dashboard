export type UrgencyIconKind = 'check' | 'alert' | 'clock' | 'calendar';

export interface UrgencyBadgeInfo {
  label: string;
  className: string;
  iconKind: UrgencyIconKind;
}

/**
 * Classifies a task's due date into urgency buckets with WCAG-safe darkened
 * Light Mode pill colors and vibrant Dark Mode pill colors.
 */
export function getTaskUrgencyBadge(
  dueDateStr: string,
  status: string,
  now: Date = new Date()
): UrgencyBadgeInfo {
  if (status === 'Submitted') {
    return {
      label: 'Submitted',
      className:
        'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
      iconKind: 'check',
    };
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Parse YYYY-MM-DD in local calendar coordinates to avoid UTC shift bugs
  const parts = dueDateStr.split('-').map((n) => parseInt(n, 10));
  const due =
    parts.length === 3 && !parts.some(Number.isNaN)
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Overdue (${Math.abs(diffDays)}d ago)`,
      className:
        'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
      iconKind: 'alert',
    };
  }
  if (diffDays === 0) {
    return {
      label: 'Due Today (23:59)',
      className:
        'bg-amber-200 text-amber-900 border-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 animate-pulse',
      iconKind: 'clock',
    };
  }
  if (diffDays === 1) {
    return {
      label: 'Due Tomorrow',
      className:
        'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
      iconKind: 'clock',
    };
  }
  if (diffDays <= 7) {
    return {
      label: `In ${diffDays} days`,
      className:
        'bg-orange-100 text-orange-800 border-orange-300 dark:bg-accent/15 dark:text-accent dark:border-accent/30',
      iconKind: 'calendar',
    };
  }
  return {
    label: `In ${diffDays} days`,
    className:
      'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    iconKind: 'calendar',
  };
}
