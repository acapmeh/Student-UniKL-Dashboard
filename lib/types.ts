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
}

export interface Profile {
  name: string;
  studentId: string;
  campus: string; // e.g. "UniKL MIIT", "UniKL BMI", etc.
  program: string; // e.g. "Bachelor of Software Engineering"
  currentSemester: string; // e.g. "Semester 4"
  targetCgpa: number;
}
