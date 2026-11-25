import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime12h,
  formatTimeRange12h,
  formatDateDMY,
  getClassTimingStatus,
  parseTimeToMinutes,
  formatCountdownMMSS,
  formatRemainingDuration,
} from '../.tmp-test/lib/timeUtils.js';

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

test('parseTimeToMinutes, formatCountdownMMSS, and formatRemainingDuration format edge values accurately', () => {
  assert.equal(parseTimeToMinutes('19:00'), 1140);
  assert.equal(parseTimeToMinutes('invalid'), null);
  assert.equal(formatCountdownMMSS(1800), '30:00');
  assert.equal(formatCountdownMMSS(1785), '29:45');
  assert.equal(formatCountdownMMSS(1), '00:01');
  assert.equal(formatRemainingDuration(60), '1h left');
  assert.equal(formatRemainingDuration(105), '1h 45m left');
  assert.equal(formatRemainingDuration(25), '25m left');
});

test('getClassTimingStatus tracks 30-minute pre-start countdown, live window, and stops cleanly at endTime', () => {
  const wedEvening = { day: 2, startTime: '19:00', endTime: '20:00' }; // Wednesday (index 2)

  // >30m before start (18:29:59) -> default
  assert.equal(getClassTimingStatus(wedEvening, new Date(2026, 10, 25, 18, 29, 59)).phase, 'default');

  // Exact 30m before start (18:30:00) -> upcoming_soon 30:00
  const at30Before = getClassTimingStatus(wedEvening, new Date(2026, 10, 25, 18, 30, 0));
  assert.equal(at30Before.phase, 'upcoming_soon');
  assert.equal(at30Before.isStartingSoon, true);
  assert.equal(at30Before.isLive, false);
  assert.equal(at30Before.countdownLabel, '30:00');

  // Mid pre-start window (18:45:12) -> 14:48
  const at184512 = getClassTimingStatus(wedEvening, new Date(2026, 10, 25, 18, 45, 12));
  assert.equal(at184512.phase, 'upcoming_soon');
  assert.equal(at184512.countdownLabel, '14:48');

  // Final second before class (18:59:59) -> 00:01
  const atFinalSec = getClassTimingStatus(wedEvening, new Date(2026, 10, 25, 18, 59, 59));
  assert.equal(atFinalSec.phase, 'upcoming_soon');
  assert.equal(atFinalSec.countdownLabel, '00:01');

  // Exact start (19:00:00) -> live 1h left
  const atStart = getClassTimingStatus(wedEvening, new Date(2026, 10, 25, 19, 0, 0));
  assert.equal(atStart.phase, 'live');
  assert.equal(atStart.isLive, true);
  assert.equal(atStart.isStartingSoon, false);
  assert.equal(atStart.remainingLabel, '1h left');

  // Mid-class (19:35:00) -> 25m left
  const atMid = getClassTimingStatus(wedEvening, new Date(2026, 10, 25, 19, 35, 0));
  assert.equal(atMid.phase, 'live');
  assert.equal(atMid.minutesRemaining, 25);
  assert.equal(atMid.remainingLabel, '25m left');

  // Final minute (19:59:30) -> rounds up to 1m left instead of 0m left
  const atFinalMin = getClassTimingStatus(wedEvening, new Date(2026, 10, 25, 19, 59, 30));
  assert.equal(atFinalMin.phase, 'live');
  assert.equal(atFinalMin.minutesRemaining, 1);
  assert.equal(atFinalMin.remainingLabel, '1m left');

  // Exact end time (20:00:00) -> stops blinking (default)
  const atEnd = getClassTimingStatus(wedEvening, new Date(2026, 10, 25, 20, 0, 0));
  assert.equal(atEnd.phase, 'default');
  assert.equal(atEnd.isLive, false);

  // Multi-hour duration (09:00 - 11:30 at 09:45) -> 1h 45m left
  const wedMorningLong = { day: 2, startTime: '09:00', endTime: '11:30' };
  const multiHour = getClassTimingStatus(wedMorningLong, new Date(2026, 10, 25, 9, 45, 0));
  assert.equal(multiHour.phase, 'live');
  assert.equal(multiHour.minutesRemaining, 105);
  assert.equal(multiHour.remainingLabel, '1h 45m left');
});

test('getClassTimingStatus ignores non-matching weekdays, weekends, and null SSR clock', () => {
  const thursdaySlot = { day: 3, startTime: '19:00', endTime: '20:00' };
  // Wednesday 19:30 -> Thursday slot must NOT blink or count down
  assert.equal(getClassTimingStatus(thursdaySlot, new Date(2026, 10, 25, 19, 30, 0)).phase, 'default');

  // Weekend Saturday 19:30 (2026-11-28) -> no Mon-Fri classes active
  const monSlot = { day: 0, startTime: '19:00', endTime: '20:00' };
  assert.equal(getClassTimingStatus(monSlot, new Date(2026, 10, 28, 19, 30, 0)).phase, 'default');

  // SSR null clock
  assert.equal(getClassTimingStatus(monSlot, null).phase, 'default');
});
