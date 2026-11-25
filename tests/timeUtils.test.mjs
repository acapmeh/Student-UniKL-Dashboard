import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTime12h, formatTimeRange12h, formatDateDMY } from '../.tmp-test/lib/timeUtils.js';

test('formatTime12h converts 24-hour timestamps including midnight, noon, morning, and evening', () => {
  assert.equal(formatTime12h('00:00'), '12:00 AM');
  assert.equal(formatTime12h('08:30'), '8:30 AM');
  assert.equal(formatTime12h('12:00'), '12:00 PM');
  assert.equal(formatTime12h('14:30'), '2:30 PM');
  assert.equal(formatTime12h('19:00'), '7:00 PM');
  assert.equal(formatTime12h('23:59'), '11:59 PM');
});

test('formatTimeRange12h formats start and end ranges with en-dash', () => {
  assert.equal(formatTimeRange12h('19:00', '20:00'), '7:00 PM – 8:00 PM');
  assert.equal(formatTimeRange12h('09:00', '11:00'), '9:00 AM – 11:00 AM');
  assert.equal(formatTimeRange12h('10:30', '12:30'), '10:30 AM – 12:30 PM');
});

test('formatDateDMY converts YYYY-MM-DD strings into dd/mm/yyyy cleanly without timezone drift', () => {
  assert.equal(formatDateDMY('2026-12-15'), '15/12/2026');
  assert.equal(formatDateDMY('2026-01-05'), '05/01/2026');
  assert.equal(formatDateDMY(''), '');
});
