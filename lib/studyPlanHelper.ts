import {
  ClassEntry,
  Grade,
  Semester,
  StudyPlanData,
  StudyPlanSubject,
  Subject,
} from './types';

export interface GroupedStudyPlanSubjects {
  st: StudyPlanSubject[];
  completed: StudyPlanSubject[];
  remaining: StudyPlanSubject[];
  totalMatches: number;
}

const COMPLETED_STATUSES = new Set(['PASS', 'CT', 'EX']);

/**
 * Normalizes a course code by stripping whitespace and uppercasing (e.g. "ehb 20403" -> "EHB20403").
 */
export function normalizeCourseCode(code?: string): string {
  return (code || '').replace(/\s+/g, '').toUpperCase();
}

/**
 * Finds the matching Study Plan subject entry for a given course code (whitespace/case insensitive).
 */
export function lookupStudyPlanSubject(
  code: string,
  plan: StudyPlanData | null | undefined
): StudyPlanSubject | null {
  if (!plan?.subjects?.length || !code.trim()) return null;
  const target = normalizeCourseCode(code);
  if (!target) return null;
  return (
    plan.subjects.find((s) => normalizeCourseCode(s.code) === target) ?? null
  );
}

/**
 * Groups Study Plan subjects into Current Semester (ST), Completed (PASS/CT/EX),
 * and Remaining/Planned buckets, optionally filtered by code, name, or category.
 */
export function groupStudyPlanSubjects(
  plan: StudyPlanData | null | undefined,
  query: string = ''
): GroupedStudyPlanSubjects {
  const list = plan?.subjects ?? [];
  const q = query.trim().toLowerCase();
  const filtered = q
    ? list.filter(
        (s) =>
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q)
      )
    : list;

  const st: StudyPlanSubject[] = [];
  const completed: StudyPlanSubject[] = [];
  const remaining: StudyPlanSubject[] = [];

  for (const subject of filtered) {
    const status = subject.status.toUpperCase();
    if (status === 'ST') {
      st.push(subject);
    } else if (COMPLETED_STATUSES.has(status)) {
      completed.push(subject);
    } else {
      remaining.push(subject);
    }
  }

  return { st, completed, remaining, totalMatches: filtered.length };
}

/**
 * Returns dual Light/Dark WCAG AA/AAA badge classes for a Study Plan subject category.
 */
export function getCategoryBadgeStyle(category?: string): string {
  const cat = (category || 'CORE').toUpperCase();
  if (cat.includes('INTRA') || cat.includes('PRACTICUM')) {
    return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
  }
  if (cat.includes('ELECTIVE')) {
    return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30';
  }
  if (cat.includes('MPU') || cat.includes('UCS')) {
    return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30';
  }
  return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
}

/**
 * Groups Completed (PASS / CT / EX) Study Plan subjects into chronological Semester records,
 * mapping CT/EX subjects to non-GPA Credit Transfer grade 'I' and preserving prior user-entered grades.
 */
export function buildSemestersFromStudyPlan(
  plan: StudyPlanData,
  existingSemesters: Semester[] = []
): Semester[] {
  const completed = (plan.subjects || [])
    .filter((s) => COMPLETED_STATUSES.has(s.status.toUpperCase()))
    .slice()
    .sort(
      (a, b) =>
        a.year - b.year || a.sem - b.sem || a.rowNumber - b.rowNumber
    );

  if (completed.length === 0) return [];

  // Preserve grades user previously recorded for matching course codes
  const priorGrades = new Map<string, Grade>();
  for (const sem of existingSemesters) {
    for (const sub of sem.subjects) {
      const key = normalizeCourseCode(sub.code);
      if (key && sub.grade) {
        priorGrades.set(key, sub.grade);
      }
    }
  }

  const buckets = new Map<
    string,
    { year: number; sem: number; items: StudyPlanSubject[] }
  >();

  for (const item of completed) {
    const key = `${item.year}-${item.sem}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.items.push(item);
    } else {
      buckets.set(key, { year: item.year, sem: item.sem, items: [item] });
    }
  }

  const orderedBuckets = Array.from(buckets.values()).sort(
    (a, b) => a.year - b.year || a.sem - b.sem
  );

  return orderedBuckets.map((bucket) => {
    const termCounts = new Map<string, number>();
    for (const s of bucket.items) {
      if (s.semesterTaken) {
        termCounts.set(s.semesterTaken, (termCounts.get(s.semesterTaken) || 0) + 1);
      }
    }
    const primaryTerm = Array.from(termCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    const baseLabel =
      bucket.year > 0 || bucket.sem > 0
        ? `Year ${bucket.year || 1} • Sem ${bucket.sem || 1}`
        : 'Completed Courses';
    const name = primaryTerm ? `${baseLabel} (${primaryTerm})` : baseLabel;

    const subjects: Subject[] = bucket.items.map((item) => {
      const normCode = normalizeCourseCode(item.code);
      const status = item.status.toUpperCase();
      const existingGrade = priorGrades.get(normCode);
      const grade: Grade =
        status === 'CT' || status === 'EX'
          ? existingGrade ?? 'I'
          : existingGrade ?? 'A';

      return {
        id: `sp-sub-${normCode}-${item.rowNumber}`,
        code: item.code,
        name: item.name,
        creditHours: item.creditHours > 0 ? item.creditHours : 3,
        grade,
        category: item.category || 'CORE',
      };
    });

    return {
      id: `sp-sem-y${bucket.year}-s${bucket.sem}`,
      name,
      subjects,
    };
  });
}

/**
 * Attaches Study Plan subject Category onto existing matching Timetable classes
 * without altering custom times, rooms, lecturers, or colors.
 */
export function enrichTimetableWithStudyPlan(
  classes: ClassEntry[],
  plan: StudyPlanData | null | undefined
): ClassEntry[] {
  if (!plan?.subjects?.length) return classes;
  return classes.map((entry) => {
    const matched = lookupStudyPlanSubject(entry.code, plan);
    if (!matched?.category) return entry;
    if (entry.category === matched.category) return entry;
    return {
      ...entry,
      category: matched.category,
    };
  });
}

/**
 * Converts a 0-based subject array index into a 1-based ordinal badge number
 * with safe fallbacks for missing or invalid values.
 */
export function getSubjectRowNumber(index?: number): number {
  if (typeof index !== 'number' || !Number.isFinite(index)) {
    return 1;
  }
  return Math.max(1, Math.floor(index) + 1);
}
