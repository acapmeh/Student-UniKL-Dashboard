import { Achievement, ClassEntry, Profile, Semester } from './types';

const PREFIX = 'unikl_dashboard_';

export const STORAGE_KEYS = {
  THEME: `${PREFIX}theme`,
  PROFILE: `${PREFIX}profile`,
  TIMETABLE: `${PREFIX}timetable`,
  RESULTS: `${PREFIX}results`,
  ACHIEVEMENTS: `${PREFIX}achievements`,
};

// Seed default profile data
export const DEFAULT_PROFILE: Profile = {
  name: 'Asyraf Zulkifli',
  studentId: '52213123456',
  campus: 'Universiti Kuala Lumpur (UniKL)',
  program: 'Bachelor of Information Technology',
  currentSemester: 'Semester 4',
  targetCgpa: 3.85,
};

// Seed default timetable classes following Image 2 layout with code, subject, lecturer, venue/online
export const DEFAULT_TIMETABLE: ClassEntry[] = [
  {
    id: 'class-1',
    code: 'CSD 201',
    subject: 'Data Structures & Algorithms',
    classType: 'Lecture',
    lecturer: 'Ts. Dr. Rahim',
    room: '0.17 Lecture Theatre',
    isOnline: false,
    day: 0, // Monday
    startTime: '10:30',
    endTime: '12:30',
    color: '#fca5a5', // Soft rose/pink (Image 2 style)
  },
  {
    id: 'class-2',
    code: 'BUS 201',
    subject: 'Technopreneurship & Management',
    classType: 'Lecture',
    lecturer: 'Prof. Madya Dr. Hisham',
    room: '0.17 Lecture Theatre',
    isOnline: false,
    day: 1, // Tuesday
    startTime: '10:30',
    endTime: '12:30',
    color: '#93c5fd', // Soft blue (Image 2 style)
  },
  {
    id: 'class-3',
    code: 'INE 301',
    subject: 'Innovation and Entrepreneurship',
    classType: 'Tutorial',
    lecturer: 'Madam Faridah',
    room: '3.46 Classroom A',
    isOnline: false,
    day: 1, // Tuesday
    startTime: '12:30',
    endTime: '14:30',
    color: '#86efac', // Soft green (Image 2 style)
  },
  {
    id: 'class-4',
    code: 'CSD 201',
    subject: 'Data Structures & Algorithms',
    classType: 'Computer Lab',
    lecturer: 'Ts. Dr. Rahim',
    room: '6.39 Computer Lab',
    isOnline: false,
    day: 1, // Tuesday
    startTime: '14:30',
    endTime: '16:30',
    color: '#fca5a5', // Soft rose/pink
  },
  {
    id: 'class-5',
    code: 'INE 301',
    subject: 'Innovation and Entrepreneurship',
    classType: 'Lecture',
    lecturer: 'Madam Faridah',
    room: 'Online Class (MS Teams)',
    isOnline: true,
    day: 4, // Friday
    startTime: '10:00',
    endTime: '12:00',
    color: '#86efac', // Soft green
  },
  {
    id: 'class-6',
    code: 'BUS 201',
    subject: 'Technopreneurship & Management',
    classType: 'Tutorial',
    lecturer: 'En. Firdaus',
    room: '4.48 Classroom B',
    isOnline: false,
    day: 4, // Friday
    startTime: '14:00',
    endTime: '16:00',
    color: '#93c5fd', // Soft blue
  },
];

// Seed default semesters with UniKL grading
export const DEFAULT_RESULTS: Semester[] = [
  {
    id: 'sem-1',
    name: 'Semester 1 (Sept 2023)',
    subjects: [
      { id: 'sub-1', code: 'CSD10103', name: 'Programming Fundamentals', creditHours: 3, grade: 'A' },
      { id: 'sub-2', code: 'CSD10203', name: 'Mathematics for Computing', creditHours: 3, grade: 'A-' },
      { id: 'sub-3', code: 'CSD10303', name: 'Computer Architecture', creditHours: 3, grade: 'B+' },
      { id: 'sub-4', code: 'MPU3113', name: 'Hubungan Etnik', creditHours: 3, grade: 'A' },
      { id: 'sub-5', code: 'ENG10102', name: 'English for Academic Purposes', creditHours: 2, grade: 'B+' },
      { id: 'sub-6', code: 'MPU3001', name: 'Co-Curriculum Service', creditHours: 1, grade: 'S' },
    ],
  },
  {
    id: 'sem-2',
    name: 'Semester 2 (Feb 2024)',
    subjects: [
      { id: 'sub-7', code: 'CSD10403', name: 'Object Oriented Programming', creditHours: 3, grade: 'A' },
      { id: 'sub-8', code: 'CSD10503', name: 'Discrete Mathematics', creditHours: 3, grade: 'B+' },
      { id: 'sub-9', code: 'CSD10603', name: 'Operating Systems', creditHours: 3, grade: 'A-' },
      { id: 'sub-10', code: 'MPU3123', name: 'Tamadun Islam dan Tamadun Asia', creditHours: 3, grade: 'A' },
      { id: 'sub-11', code: 'CSD10703', name: 'Systems Analysis & Design', creditHours: 3, grade: 'B+' },
    ],
  },
  {
    id: 'sem-3',
    name: 'Semester 3 (Sept 2024)',
    subjects: [
      { id: 'sub-12', code: 'CSD20103', name: 'Data Structures & Algorithms', creditHours: 3, grade: 'A' },
      { id: 'sub-13', code: 'CSD20203', name: 'Database Systems & Design', creditHours: 3, grade: 'A' },
      { id: 'sub-14', code: 'CSD20403', name: 'Computer Networks', creditHours: 3, grade: 'A-' },
      { id: 'sub-15', code: 'MPU3212', name: 'Technopreneurship', creditHours: 2, grade: 'A' },
      { id: 'sub-16', code: 'TC1001', name: 'Credit Transfer Subject', creditHours: 3, grade: 'I' },
    ],
  },
];

// Seed default achievements with high quality data
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: '1st Place — UniKL National Hackathon 2024',
    date: '2024-10-15',
    role: 'Team Lead & Full-Stack Developer',
    category: 'Competition & Hackathon',
    description:
      'Developed an AI-driven smart attendance and campus navigation system for UniKL students using Next.js and IoT beacons. Competed against 35 university teams across Malaysia and won the Gold Championship Trophy.',
    imageBase64: null,
  },
  {
    id: 'ach-2',
    title: 'Director — UniKL Cyber Security Awareness Day',
    date: '2024-05-20',
    role: 'Project Director',
    category: 'Club & Leadership',
    description:
      'Spearheaded a 2-day university-wide cyber security workshop and Capture-the-Flag (CTF) tournament with over 200 participants and corporate sponsors from CyberSecurity Malaysia.',
    imageBase64: null,
  },
  {
    id: 'ach-3',
    title: "Dean's List Award — Semester 1 & 2",
    date: '2024-03-10',
    role: 'Academic Honors',
    category: 'Academic & Dean’s List',
    description:
      'Awarded the Dean’s List Award for achieving GPA > 3.67 for two consecutive academic semesters in Bachelor of Information Technology.',
    imageBase64: null,
  },
];

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event('dashboard_storage_update'));
    } catch (err) {
      console.error(`Error saving to localStorage key "${key}":`, err);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new Event('dashboard_storage_update'));
    } catch (err) {
      console.error(`Error removing localStorage key "${key}":`, err);
    }
  },
};
