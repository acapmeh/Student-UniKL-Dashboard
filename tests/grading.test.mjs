import test from 'node:test';
import assert from 'node:assert/strict';
import { getAcademicStanding } from '../.tmp-test/lib/grading.js';

test("getAcademicStanding returns concise 'Dean\\'s List' label for CGPA >= 3.67 without truncation", () => {
  const res = getAcademicStanding(3.91);
  assert.equal(res.text, "Dean's List");
  assert.match(res.colorClass, /text-amber-700/);
  assert.match(res.colorClass, /dark:text-amber-400/);
});

test('getAcademicStanding returns expected standing labels for lower tiers', () => {
  assert.equal(getAcademicStanding(3.00).text, 'Good Standing');
  assert.equal(getAcademicStanding(3.25).text, 'Good Standing');
  assert.equal(getAcademicStanding(3.66).text, 'Good Standing');
  assert.equal(getAcademicStanding(2.5).text, 'Satisfactory / Pass');
  assert.equal(getAcademicStanding(1.75).text, 'Academic Warning');
  assert.equal(getAcademicStanding(null).text, 'Not Available');
});
