import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCourseCode,
  lookupStudyPlanSubject,
  groupStudyPlanSubjects,
  buildSemestersFromStudyPlan,
  enrichTimetableWithStudyPlan,
  getCategoryBadgeStyle,
} from '../.tmp-test/lib/studyPlanHelper.js';

const SAMPLE_PLAN = {
  reportId: 'PGR032',
  studentName: 'MUHAMMAD ASYRAF BIN ZULKIFLI',
  studentId: '62218125011',
  programme: 'Bachelor in Financial Technology with Honours',
  acadSem: '4',
  totalCreditToGraduate: 121,
  completedCredits: 59,
  currentSemCredits: 14,
  totalListedCredits: 182,
  importedAt: '2026-11-26T00:00:00.000Z',
  subjects: [
    {
      rowNumber: 1,
      year: 1,
      sem: 1,
      code: 'EIB10103',
      name: 'WRITING FOR ACADEMIC PURPOSES',
      creditHours: 3,
      category: 'CORE',
      semesterTaken: 'OCTOBER 2025',
      status: 'PASS',
      creditGained: 3,
    },
    {
      rowNumber: 2,
      year: 1,
      sem: 1,
      code: 'EIB10203',
      name: 'PRINCIPLES OF ECONOMICS',
      creditHours: 3,
      category: 'CORE',
      status: 'CT',
      creditGained: 3,
    },
    {
      rowNumber: 17,
      year: 1,
      sem: 3,
      code: 'EIB11103',
      name: 'BUSINESS STATISTICS',
      creditHours: 3,
      category: 'CORE',
      semesterTaken: 'OCTOBER 2026',
      status: 'ST',
    },
    {
      rowNumber: 33,
      year: 2,
      sem: 4,
      code: 'IKB10304',
      name: 'IT SECURITY',
      creditHours: 4,
      category: 'CORE',
      semesterTaken: 'OCTOBER 2026',
      status: 'ST',
    },
    {
      rowNumber: 52,
      year: 2,
      sem: 6,
      code: 'EHB20403',
      name: 'FINANCIAL MARKET AND INSTITUTIONS',
      creditHours: 3,
      category: 'CORE',
      semesterTaken: 'OCTOBER 2026',
      status: 'ST',
    },
    {
      rowNumber: 71,
      year: 3,
      sem: 9,
      code: 'EIB30308',
      name: 'INDUSTRIAL TRAINING',
      creditHours: 8,
      category: 'INTRA',
      status: 'PLANNED',
    },
  ],
};

test('normalizeCourseCode and lookupStudyPlanSubject match spacing and case differences', () => {
  assert.equal(normalizeCourseCode('ehb 20403'), 'EHB20403');
  assert.equal(normalizeCourseCode('  IKB 10304  '), 'IKB10304');

  const found = lookupStudyPlanSubject('ehb 20403', SAMPLE_PLAN);
  assert.ok(found);
  assert.equal(found.creditHours, 3);
  assert.equal(found.category, 'CORE');
  assert.equal(found.status, 'ST');

  assert.equal(lookupStudyPlanSubject('UNKNOWN 999', SAMPLE_PLAN), null);
  assert.equal(lookupStudyPlanSubject('EHB20403', null), null);
});

test('groupStudyPlanSubjects partitions ST, completed, and remaining and filters cleanly by search query', () => {
  const all = groupStudyPlanSubjects(SAMPLE_PLAN);
  assert.equal(all.st.length, 3);
  assert.equal(all.completed.length, 2);
  assert.equal(all.remaining.length, 1);
  assert.equal(all.totalMatches, 6);

  const filtered = groupStudyPlanSubjects(SAMPLE_PLAN, 'industrial');
  assert.equal(filtered.st.length, 0);
  assert.equal(filtered.completed.length, 0);
  assert.equal(filtered.remaining.length, 1);
  assert.equal(filtered.remaining[0].code, 'EIB30308');
  assert.equal(filtered.totalMatches, 1);
});

test('buildSemestersFromStudyPlan groups completed PASS/CT courses cleanly, maps CT -> grade I, and preserves prior user grades', () => {
  const priorSemesters = [
    {
      id: 'sem-1',
      name: 'Semester 1',
      subjects: [
        {
          id: 'old-1',
          code: 'EIB 10103',
          name: 'WRITING FOR ACADEMIC PURPOSES',
          creditHours: 3,
          grade: 'A-',
        },
      ],
    },
  ];

  const synced = buildSemestersFromStudyPlan(SAMPLE_PLAN, priorSemesters);
  assert.equal(synced.length, 1);
  assert.equal(synced[0].name, 'Year 1 • Sem 1 (OCTOBER 2025)');
  assert.equal(synced[0].subjects.length, 2);

  // Preserves user-edited grade 'A-' for EIB10103 while enriching category
  const passCourse = synced[0].subjects.find((s) => s.code === 'EIB10103');
  assert.equal(passCourse?.grade, 'A-');
  assert.equal(passCourse?.category, 'CORE');
  assert.equal(passCourse?.creditHours, 3);

  // Maps Credit Transfer ('CT') cleanly to UniKL non-GPA grade 'I'
  const ctCourse = synced[0].subjects.find((s) => s.code === 'EIB10203');
  assert.equal(ctCourse?.grade, 'I');
  assert.equal(ctCourse?.category, 'CORE');
});

test('enrichTimetableWithStudyPlan attaches Category onto matching classes without altering times or custom fields', () => {
  const classes = [
    {
      id: 'cls-1',
      code: 'EHB 20403',
      subject: 'FINANCIAL MARKET AND INSTITUTION',
      lecturer: 'WAN NURUL',
      room: 'Online',
      day: 2,
      startTime: '19:00',
      endTime: '20:00',
      color: '#FED7AA',
    },
    {
      id: 'cls-2',
      code: 'CUSTOM 101',
      subject: 'Workshop',
      lecturer: 'Staff',
      room: 'Lab',
      day: 0,
      startTime: '09:00',
      endTime: '10:00',
      color: '#D4E5FF',
    },
  ];

  const enriched = enrichTimetableWithStudyPlan(classes, SAMPLE_PLAN);
  assert.equal(enriched[0].category, 'CORE');
  assert.equal(enriched[0].startTime, '19:00');
  assert.equal(enriched[1].category, undefined);
});

test('getCategoryBadgeStyle returns high-contrast Light & Dark styles for CORE, ELECTIVE, INTRA, and MPU', () => {
  assert.match(getCategoryBadgeStyle('CORE'), /dark:/);
  assert.match(getCategoryBadgeStyle('ELECTIVE #'), /dark:/);
  assert.match(getCategoryBadgeStyle('INTRA'), /dark:/);
  assert.match(getCategoryBadgeStyle('MPU'), /dark:/);
});
