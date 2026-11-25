import { Grade, Semester, Subject } from './types';

export const GRADE_SCALE: Record<Grade, { point: number | null; label: string; pass: boolean; countInGpa: boolean }> = {
  'A': { point: 4.00, label: 'A (4.00)', pass: true, countInGpa: true },
  'A-': { point: 3.67, label: 'A- (3.67)', pass: true, countInGpa: true },
  'B+': { point: 3.33, label: 'B+ (3.33)', pass: true, countInGpa: true },
  'B': { point: 3.00, label: 'B (3.00)', pass: true, countInGpa: true },
  'B-': { point: 2.67, label: 'B- (2.67)', pass: true, countInGpa: true },
  'C+': { point: 2.33, label: 'C+ (2.33)', pass: true, countInGpa: true },
  'C': { point: 2.00, label: 'C (2.00)', pass: true, countInGpa: true },
  'C-': { point: 1.67, label: 'C- (1.67)', pass: true, countInGpa: true },
  'D': { point: 1.00, label: 'D (1.00)', pass: true, countInGpa: true },
  'F': { point: 0.00, label: 'F (0.00)', pass: false, countInGpa: true },
  'S': { point: null, label: 'S (Satisfactory - Non-graded)', pass: true, countInGpa: false },
  'I': { point: null, label: 'I (Credit Transfer)', pass: true, countInGpa: false },
};

export function gradeToPoint(grade: Grade): number | null {
  return GRADE_SCALE[grade]?.point ?? null;
}

export function isGradeCounted(grade: Grade): boolean {
  return GRADE_SCALE[grade]?.countInGpa ?? false;
}

export function isGradePassed(grade: Grade): boolean {
  return GRADE_SCALE[grade]?.pass ?? false;
}

export interface GpaCalculationResult {
  gpa: number | null; // null if no graded credit hours
  totalCreditHours: number; // all credits including S/I
  gradedCreditHours: number; // credits counted towards GPA
  totalGradePoints: number; // sum of (credit * point)
}

/**
 * Calculates GPA for a single list of subjects in a semester
 */
export function calcGPA(subjects: Subject[]): GpaCalculationResult {
  let totalCreditHours = 0;
  let gradedCreditHours = 0;
  let totalGradePoints = 0;

  for (const sub of subjects) {
    const cred = Number(sub.creditHours) || 0;
    totalCreditHours += cred;

    const pt = gradeToPoint(sub.grade);
    if (pt !== null && isGradeCounted(sub.grade) && cred > 0) {
      gradedCreditHours += cred;
      totalGradePoints += cred * pt;
    }
  }

  const gpa = gradedCreditHours > 0 ? Number((totalGradePoints / gradedCreditHours).toFixed(2)) : null;

  return {
    gpa,
    totalCreditHours,
    gradedCreditHours,
    totalGradePoints,
  };
}

export interface CgpaCalculationResult {
  cgpa: number | null;
  totalCreditHoursAll: number;
  totalGradedCreditsAll: number;
  totalGradePointsAll: number;
  totalSemesters: number;
}

/**
 * Calculates cumulative CGPA across all semesters
 */
export function calcCGPA(semesters: Semester[]): CgpaCalculationResult {
  let totalCreditHoursAll = 0;
  let totalGradedCreditsAll = 0;
  let totalGradePointsAll = 0;

  for (const sem of semesters) {
    for (const sub of sem.subjects) {
      const cred = Number(sub.creditHours) || 0;
      totalCreditHoursAll += cred;

      const pt = gradeToPoint(sub.grade);
      if (pt !== null && isGradeCounted(sub.grade) && cred > 0) {
        totalGradedCreditsAll += cred;
        totalGradePointsAll += cred * pt;
      }
    }
  }

  const cgpa = totalGradedCreditsAll > 0 ? Number((totalGradePointsAll / totalGradedCreditsAll).toFixed(2)) : null;

  return {
    cgpa,
    totalCreditHoursAll,
    totalGradedCreditsAll,
    totalGradePointsAll,
    totalSemesters: semesters.length,
  };
}

/**
 * Returns an honors / academic standing badge text
 */
export function getAcademicStanding(cgpa: number | null): { text: string; colorClass: string } {
  if (cgpa === null) return { text: 'Not Available', colorClass: 'text-muted' };
  if (cgpa >= 3.67) return { text: "Dean's List", colorClass: 'text-amber-700 dark:text-amber-400 font-bold' };
  if (cgpa >= 3.00) return { text: 'Good Standing / Distinction', colorClass: 'text-emerald-700 dark:text-emerald-400 font-semibold' };
  if (cgpa >= 2.00) return { text: 'Satisfactory / Pass', colorClass: 'text-blue-700 dark:text-blue-400 font-medium' };
  return { text: 'Academic Warning', colorClass: 'text-rose-700 dark:text-rose-400 font-bold' };
}
