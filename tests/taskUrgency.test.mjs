import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskUrgencyBadge } from '../.tmp-test/lib/taskUrgency.js';

const FIXED_NOW = new Date('2026-11-25T10:00:00');

test('Submitted tasks use high-contrast dark emerald text in Light Mode and bright emerald in Dark Mode', () => {
  const res = getTaskUrgencyBadge('2026-11-26', 'Submitted', FIXED_NOW);
  assert.equal(res.label, 'Submitted');
  assert.equal(res.iconKind, 'check');
  assert.match(res.className, /text-emerald-800/);
  assert.match(res.className, /dark:text-emerald-400/);
});

test('Due Tomorrow uses high-contrast amber-800 text in Light Mode', () => {
  const res = getTaskUrgencyBadge('2026-11-26', 'Pending', FIXED_NOW);
  assert.equal(res.label, 'Due Tomorrow');
  assert.equal(res.iconKind, 'clock');
  assert.match(res.className, /text-amber-800/);
  assert.match(res.className, /dark:text-amber-400/);
});

test('In 3 days uses high-contrast orange-800/amber-900 text in Light Mode', () => {
  const res = getTaskUrgencyBadge('2026-11-28', 'Pending', FIXED_NOW);
  assert.equal(res.label, 'In 3 days');
  assert.equal(res.iconKind, 'calendar');
  assert.match(res.className, /text-orange-800/);
  assert.match(res.className, /dark:text-accent/);
});

test('Overdue and Due Today return crisp darkened Light Mode colors', () => {
  const overdue = getTaskUrgencyBadge('2026-11-23', 'Pending', FIXED_NOW);
  assert.equal(overdue.label, 'Overdue (2d ago)');
  assert.match(overdue.className, /text-rose-800/);

  const today = getTaskUrgencyBadge('2026-11-25', 'Pending', FIXED_NOW);
  assert.equal(today.label, 'Due Today (23:59)');
  assert.match(today.className, /text-amber-900/);
});
