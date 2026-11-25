import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStudyPlanFromPages } from '../.tmp-test/lib/studyPlanParser.js';

/**
 * Coordinates mirror a standard landscape/portrait PGR032 PDF layout:
 * # (~25), Year (~45), Sem (~70), Subject (~95), Name (~150..295),
 * Credit (~305), Category (~335), Pre-Requisite (~405),
 * Semester (~470), Status (~525), Credit Gained (~565).
 */
function headerRowSpans(y) {
  return [
    { str: '#', x: 25, y, width: 8 },
    { str: 'Year', x: 45, y, width: 20 },
    { str: 'Sem', x: 70, y, width: 18 },
    { str: 'Subject', x: 95, y, width: 35 },
    { str: 'Name', x: 150, y, width: 30 },
    { str: 'Credit', x: 302, y, width: 25 },
    { str: 'Category', x: 335, y, width: 42 },
    { str: 'Pre- Requisite', x: 405, y, width: 55 },
    { str: 'Semester', x: 470, y, width: 42 },
    { str: 'Status', x: 525, y, width: 30 },
    { str: 'Credit Gained', x: 565, y, width: 40 },
  ];
}

test('parseStudyPlanFromPages extracts metadata, multi-line wrapped names, statuses, excludes Pre-Requisite codes, and captures totals', () => {
  const page1 = [
    { str: 'Report ID : PGR032', x: 25, y: 780 },
    { str: 'Institute :', x: 25, y: 760 },
    { str: 'UNIVERSITI KUALA LUMPUR BUSINESS SCHOOL', x: 95, y: 760 },
    { str: 'Programme :', x: 25, y: 745 },
    { str: 'Bachelor in Financial Technology with Honours', x: 95, y: 745 },
    { str: 'Student ID :', x: 25, y: 730 },
    { str: '62218125011', x: 95, y: 730 },
    { str: 'Name :', x: 240, y: 730 },
    { str: 'MUHAMMAD ASYRAF BIN ZULKIFLI', x: 290, y: 730 },
    { str: 'Intake Sem :', x: 25, y: 715 },
    { str: '2025/2026-1', x: 95, y: 715 },
    { str: 'Acad Sem :', x: 240, y: 715 },
    { str: '4', x: 290, y: 715 },
    { str: 'Total Credit to Graduate :', x: 340, y: 715 },
    { str: '121', x: 465, y: 715 },
    { str: 'Academic Advisor :', x: 25, y: 700 },
    { str: 'MOHD HARRIDON BIN MOHAMED SUFFIAN', x: 120, y: 700 },

    ...headerRowSpans(665),

    // Row 1: PASS with credit gained
    { str: '1', x: 25, y: 645 },
    { str: '1', x: 45, y: 645 },
    { str: '1', x: 70, y: 645 },
    { str: 'MPU3142', x: 95, y: 645 },
    { str: 'BAHASA MELAYU KOMUNIKASI 2', x: 150, y: 645 },
    { str: '2', x: 305, y: 645 },
    { str: 'MPU', x: 335, y: 645 },
    { str: '2025/2026-1', x: 470, y: 645 },
    { str: 'PASS', x: 525, y: 645 },
    { str: '2', x: 570, y: 645 },

    // Row 2: CT (Credit Transfer) with a Pre-Requisite subject code
    { str: '2', x: 25, y: 625 },
    { str: '1', x: 45, y: 625 },
    { str: '1', x: 70, y: 625 },
    { str: 'EIB10103', x: 95, y: 625 },
    { str: 'PRINCIPLES OF ACCOUNTING', x: 150, y: 625 },
    { str: '3', x: 305, y: 625 },
    { str: 'CORE', x: 335, y: 625 },
    { str: 'WAD10101', x: 405, y: 625 },
    { str: '2025/2026-1', x: 470, y: 625 },
    { str: 'CT', x: 525, y: 625 },
    { str: '3', x: 570, y: 625 },
  ];

  const page2 = [
    ...headerRowSpans(740),
    // Row 3: 3-line wrapped Name + Pre-Requisite code EIB11503 + ST status (4 credits)
    { str: '21', x: 25, y: 715 },
    { str: '2', x: 45, y: 715 },
    { str: '4', x: 70, y: 715 },
    { str: 'IKB10304', x: 95, y: 715 },
    { str: 'IT SECURITY', x: 150, y: 715 },
    { str: '4', x: 305, y: 715 },
    { str: 'CORE', x: 335, y: 715 },
    { str: 'EIB11503', x: 405, y: 715 },
    { str: '2026/2027-4', x: 470, y: 715 },
    { str: 'ST', x: 525, y: 715 },

    // Row 4: 3-line wrapped title + multiple prerequisite codes + empty status -> PLANNED
    { str: '45', x: 25, y: 685 },
    { str: '3', x: 45, y: 685 },
    { str: '7', x: 70, y: 685 },
    { str: 'EFB30103', x: 95, y: 685 },
    { str: 'STATISTICS MODELING AND', x: 150, y: 685 },
    { str: '3', x: 305, y: 685 },
    { str: 'CORE', x: 335, y: 685 },
    { str: 'IQB10104', x: 405, y: 685 },
    // Continuation line 1
    { str: 'ANALYSIS IN FINANCIAL', x: 150, y: 672 },
    { str: 'ISB16003', x: 405, y: 672 },
    // Continuation line 2
    { str: 'ENGINEERING', x: 150, y: 659 },

    // Row 5: Current Sem ST 1-credit subject (no credit gained)
    { str: '46', x: 25, y: 635 },
    { str: '2', x: 45, y: 635 },
    { str: '4', x: 70, y: 635 },
    { str: 'WKD10201', x: 95, y: 635 },
    { str: 'KOREAN LANGUAGE 2', x: 150, y: 635 },
    { str: '1', x: 305, y: 635 },
    { str: 'ELEC', x: 335, y: 635 },
    { str: '2026/2027-4', x: 470, y: 635 },
    { str: 'ST', x: 525, y: 635 },
  ];

  const page3 = [
    ...headerRowSpans(740),
    // Bottom catalog summary row without # column — must NOT create a subject row
    { str: '182', x: 302, y: 400 },
    { str: '54', x: 570, y: 400 },
    { str: 'Legend/Note:', x: 25, y: 370 },
    { str: 'Other Subjects', x: 25, y: 340 },
  ];

  const page4 = [
    { str: 'SUMMARY', x: 25, y: 740 },
    { str: 'Total Credits to Graduate (TCG) :', x: 25, y: 710 },
    { str: '121', x: 240, y: 710 },
    { str: 'Semester Credit Taken (SCT) :', x: 25, y: 690 },
    { str: '14', x: 240, y: 690 },
    { str: 'TOTAL :', x: 25, y: 660 },
    { str: '121', x: 240, y: 660 },
    { str: '59', x: 300, y: 660 },
  ];

  const parsed = parseStudyPlanFromPages([page1, page2, page3, page4], '2026-11-25T12:00:00.000Z');

  assert.equal(parsed.reportId, 'PGR032');
  assert.equal(parsed.institute, 'UNIVERSITI KUALA LUMPUR BUSINESS SCHOOL');
  assert.equal(parsed.programme, 'Bachelor in Financial Technology with Honours');
  assert.equal(parsed.studentId, '62218125011');
  assert.equal(parsed.studentName, 'MUHAMMAD ASYRAF BIN ZULKIFLI');
  assert.equal(parsed.acadSem, '4');
  assert.equal(parsed.academicAdvisor, 'MOHD HARRIDON BIN MOHAMED SUFFIAN');

  // Exactly 5 subjects: prerequisite codes (WAD10101, EIB11503, IQB10104, ISB16003) MUST NOT become subjects
  assert.equal(parsed.subjects.length, 5);

  const codes = parsed.subjects.map((s) => s.code);
  assert.deepEqual(codes, ['MPU3142', 'EIB10103', 'IKB10304', 'EFB30103', 'WKD10201']);

  // Wrapped 3-line name merged cleanly + prereqs captured
  const statModeling = parsed.subjects.find((s) => s.code === 'EFB30103');
  assert.ok(statModeling);
  assert.equal(statModeling.name, 'STATISTICS MODELING AND ANALYSIS IN FINANCIAL ENGINEERING');
  assert.equal(statModeling.creditHours, 3);
  assert.equal(statModeling.status, 'PLANNED');
  assert.equal(statModeling.preRequisite, 'IQB10104, ISB16003');

  // ST statuses and credit hours
  const itSec = parsed.subjects.find((s) => s.code === 'IKB10304');
  assert.equal(itSec?.creditHours, 4);
  assert.equal(itSec?.status, 'ST');
  assert.equal(itSec?.preRequisite, 'EIB11503');

  const korean = parsed.subjects.find((s) => s.code === 'WKD10201');
  assert.equal(korean?.creditHours, 1);
  assert.equal(korean?.status, 'ST');

  // Totals extracted from Page 4 SUMMARY / row sums
  assert.equal(parsed.totalCreditToGraduate, 121);
  assert.equal(parsed.completedCredits, 59);
  assert.equal(parsed.currentSemCredits, 14);
  assert.equal(parsed.totalListedCredits, 182);
  assert.equal(parsed.importedAt, '2026-11-25T12:00:00.000Z');
});

test('parseStudyPlanFromPages throws a descriptive validation error when PDF contains no study plan rows', () => {
  const randomInvoicePage = [
    { str: 'INVOICE #99412', x: 40, y: 740 },
    { str: 'Total Due: MYR 250.00', x: 40, y: 710 },
  ];

  assert.throws(
    () => parseStudyPlanFromPages([randomInvoicePage]),
    /study plan|subject/i
  );
});
