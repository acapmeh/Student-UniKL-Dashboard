export type Grade =
  | 'A'
  | 'A-'
  | 'B+'
  | 'B'
  | 'B-'
  | 'C+'
  | 'C'
  | 'C-'
  | 'D'
  | 'F'
  | 'S'
  | 'I';

export interface Subject {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  grade: Grade;
}

export interface Semester {
  id: string;
  name: string; // e.g. "Semester 1", "Semester 2 (Jul 2024)"
  subjects: Subject[];
}

export type ClassType = 'Lecture' | 'Tutorial' | 'Computer Lab' | 'Workshop' | 'Studio';

export interface ClassEntry {
  id: string;
  code: string; // e.g. "CSD20103"
  subject: string; // e.g. "Data Structures & Algorithms"
  classType?: ClassType; // e.g. "Lecture", "Tutorial", "Computer Lab"
  lecturer: string; // e.g. "Ts. Dr. Rahim"
  room: string; // e.g. "Lab 4, Level 5" or "MS Teams"
  isOnline?: boolean; // true if online class
  day: 0 | 1 | 2 | 3 | 4; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
  startTime: string; // "HH:MM" e.g. "10:30"
  endTime: string; // "HH:MM" e.g. "12:30"
  color: string; // Pastel/modern color e.g. "#fecdd3" (pink), "#bfdbfe" (blue), "#dcfce7" (green)
}

export interface Achievement {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  role?: string; // e.g. "Lead Organizer", "Participant"
  description: string;
  category?: string; // e.g. "Competition", "Club", "Volunteering"
  imageBase64: string | null;
  photoUrl?: string | null;
}

export interface AcademicAdvisor {
  name: string;
  email: string;
  phone: string;
}

export interface Profile {
  name: string;
  studentId: string;
  campus: string; // e.g. "UniKL MIIT", "UniKL BMI", etc.
  program: string; // e.g. "Bachelor of Software Engineering"
  currentSemester: string; // e.g. "Semester 4"
  targetCgpa: number;
  advisor?: AcademicAdvisor;
}

export type TaskType = 'Assignment' | 'Quiz' | 'Project' | 'Lab Report' | 'Midterm Test';
export type TaskStatus = 'Pending' | 'Submitted';

export interface TaskItem {
  id: string;
  title: string;
  courseCode: string; // e.g. "IKB 10304"
  courseName?: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM e.g. "23:59"
  weightage?: number; // e.g. 15 (%)
  status: TaskStatus;
  submissionLink?: string;
  notes?: string;
}

export interface ExamPaper {
  id: string;
  courseCode: string;
  courseName: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  venue: string; // e.g. "Exam Hall 1, Level 3"
  seatNumber?: string; // e.g. "B-24"
}

export interface UniversityExamPeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  semesterLabel: string;
}

export interface StudyPlanSubject {
  rowNumber: number;
  year: number;
  sem: number;
  code: string;
  name: string;
  creditHours: number;
  category: string;
  preRequisite?: string;
  semesterTaken?: string;
  status: string;
  creditGained?: number;
}

export interface StudyPlanData {
  reportId?: string;
  studentName?: string;
  studentId?: string;
  programme?: string;
  institute?: string;
  acadSem?: string;
  academicAdvisor?: string;
  totalCreditToGraduate: number;
  completedCredits: number;
  currentSemCredits: number;
  totalListedCredits: number;
  subjects: StudyPlanSubject[];
  importedAt: string;
}
