'use client';

import React from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, LucideIcon } from 'lucide-react';
import { getTaskUrgencyBadge, UrgencyIconKind } from '@/lib/taskUrgency';

interface UrgencyBadgePillProps {
  dueDate: string;
  status: string;
  size?: 'sm' | 'md';
}

const ICONS: Record<UrgencyIconKind, LucideIcon> = {
  check: CheckCircle2,
  alert: AlertCircle,
  clock: Clock,
  calendar: Calendar,
};

export function UrgencyBadgePill({ dueDate, status, size = 'sm' }: UrgencyBadgePillProps) {
  const urgency = getTaskUrgencyBadge(dueDate, status);
  const IconComponent = ICONS[urgency.iconKind];
  const isCompact = size === 'sm';

  return (
    <span
      className={`${
        isCompact ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-3 py-1 gap-1.5'
      } font-bold rounded-full border inline-flex items-center whitespace-nowrap ${urgency.className}`}
    >
      <IconComponent size={isCompact ? 11 : 14} />
      <span>{urgency.label}</span>
    </span>
  );
}
