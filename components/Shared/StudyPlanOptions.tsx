import React from 'react';
import { GroupedStudyPlanSubjects } from '@/lib/studyPlanHelper';

interface StudyPlanOptionsProps {
  grouped: GroupedStudyPlanSubjects;
  keyPrefix: string;
  stFirst?: boolean;
  includeCompleted?: boolean;
}

/**
 * Shared grouped `<optgroup>` list for selecting UniKL Study Plan subjects
 * uniformly across Timetable, Academic Results, and What-If Simulator dropdowns.
 */
export function StudyPlanOptions({
  grouped,
  keyPrefix,
  stFirst = true,
  includeCompleted = true,
}: StudyPlanOptionsProps) {
  const stBlock =
    grouped.st.length > 0 ? (
      <optgroup label="★ Current Semester (ST)">
        {grouped.st.map((s) => (
          <option key={`${keyPrefix}-st-${s.rowNumber}-${s.code}`} value={s.code}>
            {`${s.code} — ${s.name} (${s.creditHours} Cr • ${s.category})`}
          </option>
        ))}
      </optgroup>
    ) : null;

  const remainingBlock =
    grouped.remaining.length > 0 ? (
      <optgroup label="Remaining / Upcoming Subjects">
        {grouped.remaining.map((s) => (
          <option key={`${keyPrefix}-rem-${s.rowNumber}-${s.code}`} value={s.code}>
            {`${s.code} — ${s.name} (${s.creditHours} Cr • ${s.category})`}
          </option>
        ))}
      </optgroup>
    ) : null;

  const completedBlock =
    includeCompleted && grouped.completed.length > 0 ? (
      <optgroup label="Completed (PASS / CT)">
        {grouped.completed.map((s) => (
          <option key={`${keyPrefix}-done-${s.rowNumber}-${s.code}`} value={s.code}>
            {`${s.code} — ${s.name} (${s.creditHours} Cr • ${s.category})`}
          </option>
        ))}
      </optgroup>
    ) : null;

  return (
    <>
      {stFirst && stBlock}
      {completedBlock}
      {remainingBlock}
      {!stFirst && stBlock}
    </>
  );
}
